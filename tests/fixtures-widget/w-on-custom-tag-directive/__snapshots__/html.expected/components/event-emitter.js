import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "<fixture-dir>/components/event-emitter.marko",
  _marko_template = _t(_marko_componentType);
export default _marko_template;
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {
  trigger() {
    this.emit("thing", 1);
    this.emit("Thing", 2);
  }
};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  out.w("<button>");
  out.w("trigger");
  out.w("</button>");
}, {
  t: _marko_componentType,
  d: true
}, _marko_component);