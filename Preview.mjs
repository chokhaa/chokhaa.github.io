import { h } from './vendor/preact.module.js';

export default function Preview({ $model }) {
  const { arguments: args, vdom } = $model;
  return renderVnode(vdom, args);
}

function renderVnode(vnode, args, localbindings) {
  const localvars = {};
  if (localbindings) {
    Object.keys(localbindings).forEach(key => {
      const [it, i] = key.split(",").map(tok => tok.trim());
      localvars[it] = localbindings[key][0];
      localvars[i] = localbindings[key][1];
    })
  }
  const attrs = getEvaluatedValues(vnode.attrs || {}, { ...args, ...localvars });
  // const props = getEvaluatedValues(vnode.props || {}, args);
  const children = renderChildren(vnode, args);
  if (vnode._meta.selected) {
    attrs.style = 'border: solid 1px red;' + attrs.style;
  }

  let output = h(vnode.renderer, attrs, children);
  // if (typeof vnode.renderer === 'string') {
  //   output = h(vnode.renderer, attrs, children);
  // } else {
  //   output = h(vnode.renderer, props, children);
  // }
  return output;
}

function renderChildren(vnode, args) {
  return vnode.children.flatMap(child => {
    const onlyifandfor = {}
    if (child.attrs['c-for']) {
      onlyifandfor['c-for'] = child.attrs['c-for'];
    }
    if (child.attrs['c-if']) {
      onlyifandfor['c-if'] = child.attrs['c-if'];
    }
    const attrs = getEvaluatedValues(onlyifandfor, args);
    // const props = getEvaluatedValues(child.props || {}, args);
    if (attrs['c-if'] !== undefined && !attrs['c-if']) {
      return null;
    } else if (attrs['c-for']) {
      return attrs['c-for'].map((item, i) => renderVnode(child, args, {[child.attrs["c-for"].cforitr]: [child.attrs["c-for"].value + `[${i}]`, i]}));
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
    return expr + ` let ${key} = ${context[key] || null};`;
  }, '');
  // const contextstring = context;
  const value = `(() => {
    ${contextstring}
    return ${expression};
  })()`
  try {
    return eval(value);
  } catch(e) {
    console.error(e);
    alert(e);
    return undefined;
  }
}