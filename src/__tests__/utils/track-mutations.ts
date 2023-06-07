import type { JSDOM } from "jsdom";
import format, { plugins } from "pretty-format";

const { DOMElement, DOMCollection } = plugins;

export default function createMutationTracker(
  window: JSDOM["window"],
  container: ParentNode
) {
  let currentRecords: MutationRecord[] | null = null;
  const result: string[] = [];
  const errors: Set<Error> = new Set();
  const throwErrors = () => {
    switch (errors.size) {
      case 0:
        return;
      case 1:
        for (const err of errors) throw err;
        break;
      default:
        throw new AggregateError(
          errors,
          `\n${[...errors].join("\n").replace(/^(?!\s*$)/gm, "\t")}`
        );
    }
  };
  const handleError = (ev: ErrorEvent) => {
    errors.add(ev.error.detail || ev.error);
    ev.preventDefault();
  };
  const handleRejection = (ev: PromiseRejectionEvent) => {
    errors.add(ev.reason.detail || ev.reason);
    ev.preventDefault();
  };
  const tracker = {
    log(message: string) {
      result.push(message);
    },
    logUpdate(update: unknown) {
      throwErrors();
      if (currentRecords) {
        currentRecords = currentRecords.concat(observer.takeRecords());
      } else {
        currentRecords = observer.takeRecords();
      }
      result.push(
        getStatusString(cloneAndNormalize(container), currentRecords, update)
      );
      currentRecords = null;
    },
    getLogs() {
      return result.join("\n\n");
    },
    cleanup() {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      observer.disconnect();
      throwErrors();
    },
  };
  const observer = new window.MutationObserver((records) => {
    if (currentRecords) {
      currentRecords = currentRecords.concat(records);
    } else {
      currentRecords = records;
      tracker.logUpdate("ASYNC");
    }
  });

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);
  observer.observe(container, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
  });

  return tracker;
}

function cloneAndNormalize(container: ParentNode) {
  const idMap: Map<string, number> = new Map();
  const clone = container.cloneNode(true);
  const document = isDocument(container) ? container : container.ownerDocument!;
  const commentAndElementWalker = document.createTreeWalker(
    clone,
    1 /** SHOW_ELEMENT */ | 128 /** SHOW_COMMENT */
  );

  let node: Comment | Element;
  let nextNode = commentAndElementWalker.nextNode();
  while ((node = nextNode as Comment | Element)) {
    nextNode = commentAndElementWalker.nextNode();
    if (isComment(node)) {
      node.remove();
    } else {
      const { id, attributes } = node;
      if (/\d/.test(id)) {
        let idIndex = idMap.get(id);

        if (idIndex === undefined) {
          idIndex = idMap.size;
          idMap.set(id, idIndex);
        }

        node.id = `GENERATED-${idIndex}`;
      }

      for (let i = attributes.length; i--; ) {
        const attr = attributes[i];

        if (/^data-(w-|widget$|marko(-|$))/.test(attr.name)) {
          node.removeAttributeNode(attr);
        }
      }
    }
  }

  if (idMap.size) {
    const elementWalker = document.createTreeWalker(
      clone,
      1 /** SHOW_ELEMENT */
    );

    nextNode = elementWalker.nextNode();
    while ((node = nextNode as Element)) {
      nextNode = elementWalker.nextNode();
      const { attributes } = node;

      for (let i = attributes.length; i--; ) {
        const attr = attributes[i];
        const { value } = attr;
        const updated = value
          .split(" ")
          .map((part) => {
            const idIndex = idMap.get(part);
            if (idIndex === undefined) {
              return part;
            }

            return `GENERATED-${idIndex}`;
          })
          .join(" ");

        if (value !== updated) {
          attr.value = updated;
        }
      }
    }
  }

  clone.normalize();

  return clone;
}

function getStatusString(
  container: Node,
  records: MutationRecord[],
  update: unknown
) {
  const updateString =
    update == null ||
    (typeof update === "object" && !Object.keys(update).length)
      ? ""
      : typeof update === "function"
      ? `\n${update
          .toString()
          .replace(/^.*?{\s*([\s\S]*?)\s*}.*?$/, "$1")
          .replace(/^ {4}/gm, "")}\n`
      : ` ${JSON.stringify(update)}`;

  const formattedHTML = Array.from(container.childNodes)
    .map((child) =>
      format(child, {
        plugins: [DOMElement, DOMCollection],
      }).trim()
    )
    .filter(Boolean)
    .join("\n")
    .trim();

  const formattedMutations = records
    .map(formatMutationRecord)
    .filter(Boolean)
    .join("\n");

  return `# Render${updateString}\n\`\`\`html\n${formattedHTML}\n\`\`\`${
    formattedMutations
      ? `\n\n# Mutations\n\`\`\`\n${formattedMutations}\n\`\`\``
      : ""
  }`;
}

function formatMutationRecord(record: MutationRecord) {
  const { target, oldValue } = record;

  switch (record.type) {
    case "attributes": {
      const { attributeName } = record;
      const newValue = (target as HTMLElement).getAttribute(
        attributeName as string
      );
      return `${getNodePath(target)}: attr(${attributeName}) ${JSON.stringify(
        oldValue
      )} => ${JSON.stringify(newValue)}`;
    }

    case "characterData": {
      const newValue = target.nodeValue;

      // if the new value begins with the old value
      // and whitespace delimits the old value and remaining new value
      if (
        newValue?.indexOf(oldValue!) === 0 &&
        (/\s$/ms.test(oldValue!) || /\s$/ms.test(newValue![oldValue!.length]))
      ) {
        // filter out invalid records that jsdom creates
        // see https://github.com/jsdom/jsdom/issues/3261
        // TODO: remove if fixed
        return;
      }

      return `${getNodePath(target)}: ${JSON.stringify(
        oldValue || ""
      )} => ${JSON.stringify(target.nodeValue || "")}`;
    }

    case "childList": {
      const { removedNodes, addedNodes, previousSibling, nextSibling } = record;
      const details: string[] = [];
      if (removedNodes.length) {
        const relativeNode = previousSibling || nextSibling || target;
        const position =
          relativeNode === previousSibling
            ? "after"
            : relativeNode === nextSibling
            ? "before"
            : "in";
        details.push(
          `removed ${Array.from(removedNodes)
            .map(getNodePath)
            .join(", ")} ${position} ${getNodePath(relativeNode)}`
        );
      }

      if (addedNodes.length) {
        details.push(
          `inserted ${Array.from(addedNodes).map(getNodePath).join(", ")}`
        );
      }

      return details.join("\n");
    }
  }
}

function getNodePath(node: Node) {
  const parts: string[] = [];
  let cur: Node | null = node;
  while (cur) {
    const { parentNode } = cur;

    let name = getNodeTypeName(cur);
    const index = parentNode
      ? (Array.from(parentNode.childNodes) as Node[]).indexOf(cur)
      : -1;

    if (index !== -1) {
      name += `${index}`;
    }

    parts.unshift(name);

    if (
      !parentNode ||
      (parentNode as any).TEST_ROOT ||
      parentNode === parentNode.ownerDocument?.body
    ) {
      break;
    }

    cur = parentNode as Node;
  }

  return parts.join("/");
}

function getNodeTypeName(node: Node) {
  return node.nodeName.toLowerCase();
}

function isDocument(node: Node): node is Document {
  return node.nodeType === 9 /* Node.DOCUMENT_NODE */;
}

function isComment(node: Node): node is Comment {
  return node.nodeType === 8 /* Node.COMMENT_NODE */;
}
