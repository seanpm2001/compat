import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "<fixture-dir>/template.marko",
  _marko_template = _t(_marko_componentType);
export default _marko_template;
import Component1 from "./components/component-1.marko";
import Component2Template from "./components/component-2.marko";
import _Component from "./components/component-3.marko";
import Component4Template from "./components/component-4.marko";
const Component2 = "test";
const Component3 = "test";
const Component3Template = "test";
import _marko_tag from "marko/src/runtime/helpers/render-tag.js";
import { x as _marko_escapeXml } from "marko/src/runtime/html/helpers/escape-xml.js";
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  out.w("<div id=no-body>");
  {
    const _tagName = input.show1 ? Component1 : null;
    if (_tagName) _marko_tag(_tagName, {}, out, _componentDef, "1");
    const _tagName2 = input.show2 ? Component2Template : null;
    if (_tagName2) _marko_tag(_tagName2, {}, out, _componentDef, "2");
    const _tagName3 = input.show3 ? _Component : null;
    if (_tagName3) _marko_tag(_tagName3, {}, out, _componentDef, "3");
    const _tagName4 = input.show4 ? Component4Template : null;
    if (_tagName4) _marko_tag(_tagName4, {}, out, _componentDef, "4");
  }
  out.w("</div>");
  out.w("<div id=with-body>");
  {
    const _tagName5 = input.show1 ? Component1 : null;
    const _renderBody = out => {
      out.w("Body 1");
    };
    if (_tagName5) _marko_tag(_tagName5, {
      "renderBody": _renderBody
    }, out, _componentDef, "6");else _renderBody(out);
    const _tagName6 = input.show2 ? Component2Template : null;
    const _renderBody2 = out => {
      out.w("Body 2");
    };
    if (_tagName6) _marko_tag(_tagName6, {
      "renderBody": _renderBody2
    }, out, _componentDef, "7");else _renderBody2(out);
    const _tagName7 = input.show3 ? _Component : null;
    const _renderBody3 = out => {
      out.w("Body 3");
    };
    if (_tagName7) _marko_tag(_tagName7, {
      "renderBody": _renderBody3
    }, out, _componentDef, "8");else _renderBody3(out);
    const _tagName8 = input.show4 ? Component4Template : null;
    const _renderBody4 = out => {
      out.w("Body 4");
    };
    if (_tagName8) _marko_tag(_tagName8, {
      "renderBody": _renderBody4
    }, out, _componentDef, "9");else _renderBody4(out);
  }
  out.w("</div>");
  out.w("Referenced Global ");
  out.w(_marko_escapeXml(typeof Component4 === "undefined"));
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);