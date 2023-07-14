import { types as t } from "@marko/compiler";
import { diagnosticError, withLoc } from "@marko/babel-utils";

export default {
  exit(tag: t.NodePath<t.MarkoTag>) {
    let hasErrors = false;
    if (!tag.node.attributes.length) {
      diagnosticError(tag, {
        label: "The <invoke> tag requires a value.",
      });
      hasErrors = true;
    }

    const attrs = tag.get("attributes");
    const functionAttr = attrs[0] as t.NodePath<t.MarkoAttribute>;
    if (
      functionAttr &&
      !(
        isDefaultAttributeValue(functionAttr.node) &&
        functionAttr.node.arguments
      )
    ) {
      diagnosticError(functionAttr, {
        label: "The <invoke> tag requires a function call.",
      });
      hasErrors = true;
    }

    if (attrs.length > 1) {
      diagnosticError(attrs[1], {
        label: "The <invoke> tag does not support other attributes.",
      });
      hasErrors = true;
    }

    if (hasErrors) {
      tag.remove();
      return;
    }

    const { file } = tag.hub;
    const start = functionAttr.node.start;
    const callIdentifier = t.identifier(functionAttr.node.name);
    const callExpression = t.callExpression(
      callIdentifier,
      functionAttr.node.arguments!,
    );
    if (start != null) {
      withLoc(
        file,
        callIdentifier,
        start,
        start + functionAttr.node.name.length,
      );

      withLoc(file, callExpression, start, functionAttr.node.end!);
    }

    tag.replaceWith(
      t.markoScriptlet([t.expressionStatement(callExpression)], false),
    );
  },
};

function isDefaultAttributeValue(
  node: t.MarkoAttribute | t.MarkoSpreadAttribute,
): node is t.MarkoAttribute {
  return (
    node.type === "MarkoAttribute" &&
    !node.value.loc &&
    node.value.type === "BooleanLiteral" &&
    node.value.value
  );
}
