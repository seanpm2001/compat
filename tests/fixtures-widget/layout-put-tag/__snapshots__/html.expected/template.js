import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "<fixture-dir>/template.marko",
  _marko_template = _t(_marko_componentType);
export default _marko_template;
import _marko_self_iterator from "marko/src/runtime/helpers/self-iterator.js";
import _test from "./components/test.marko";
import _marko_tag from "marko/src/runtime/helpers/render-tag.js";
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  _marko_tag(_test, {
    "a": {
      "renderBody": out => {
        out.w("<div>");
        out.w("1");
        out.w("</div>");
      },
      [Symbol.iterator]: _marko_self_iterator
    },
    "b": {
      "renderBody": out => {
        out.w("2");
      },
      [Symbol.iterator]: _marko_self_iterator
    }
  }, out, _componentDef, "0");
  _marko_tag(_test, {
    "a": {
      "renderBody": out => {
        out.w("<div>");
        out.w("1");
        out.w("</div>");
      },
      [Symbol.iterator]: _marko_self_iterator
    },
    "b": {
      "renderBody": out => {
        out.w("2");
      },
      [Symbol.iterator]: _marko_self_iterator
    }
  }, out, _componentDef, "2");
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);