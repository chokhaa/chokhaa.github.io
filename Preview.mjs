import { h } from './vendor/preact.module.js';

export default function Preview({ $model }) {
  return render($model);
}

function render(model) {
  const { arguments: args, vdom } = model;

  return renderVnode(vdom, evalMultipleInContext(args, {}));
}

function renderVnode(vnode, args) {
  const attrs = getEvaluatedValues(vnode.attrs || {}, args);
  const props = getEvaluatedValues(vnode.props || {}, args);
  const children = renderChildren(vnode, args);
  if (vnode._meta.selected) {
    attrs.style = 'border: solid 1px red;' + attrs.style;
  }
  let output;
  output = h(vnode.renderer, attrs, children);
  // if (typeof vnode.renderer === 'string') {
  //   output = h(vnode.renderer, attrs, children);
  // } else {
  //   output = h(vnode.renderer, props, children);
  // }
  return output;
}

function renderChildren(vnode, args) {
  return vnode.children.flatMap(child => {
    const attrs = getEvaluatedValues(child.attrs || {}, args);
    const props = getEvaluatedValues(child.props || {}, args);
    if (attrs['c-if'] !== undefined && !attrs['c-if']) {
      return null;
    } else if (attrs['c-for']) {
      return attrs['c-for'].map(() => renderVnode(child, args));
    } else {
      return renderVnode(child, args);
    }
  });
}

function getEvaluatedValues(vdomconfs, context) {
  const assocArray = Object.entries(vdomconfs).map(([key, conf]) => [key, conf.value || conf.default])
    .map(([key, value]) => [key, evalInContext(value, context)]);
  return Object.fromEntries(assocArray);
}

function evalMultipleInContext(expressions, context) {
  const exprvals = Object.keys(expressions).map(exprname => [exprname, evalInContext(expressions[exprname], context)]);
  return Object.fromEntries(exprvals);
}

function evalInContext(expression, context) {
  const contextstring = Object.keys(context).reduce((expr, key) => {
    const value = JSON.stringify(context[key]);
    return expr + ` let ${key} = ${value};`;
  }, '');
  const value = `(() => {
    ${contextstring}
    return ${expression};
  })()`
  return eval(value);
}