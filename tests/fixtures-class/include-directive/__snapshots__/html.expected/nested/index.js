import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "<fixture-dir>/nested/index.marko",
  _marko_template = _t(_marko_componentType);
export default _marko_template;
import { x as _marko_escapeXml } from "marko/src/runtime/html/helpers/escape-xml.js";
import _marko_dynamic_tag from "marko/src/runtime/helpers/dynamic-tag.js";
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  out.w("nested/index.marko ");
  out.w(_marko_escapeXml(JSON.stringify(input)));
  _marko_dynamic_tag(out, input.renderBody, null, null, null, null, _componentDef, "0");
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);