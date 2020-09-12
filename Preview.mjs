import { h } from './vendor/preact.module.js';
// import { useContext } from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module';
// import { initialModel as model } from './model.mjs';

export default function Preview({ $model }) {
  return renderNode($model);
}

function renderNode(node) {
  let children = node.children;
  if (children instanceof Array) {
    children = children.map(child => {
      if (typeof child === 'object') {
        return renderNode(child);
      } else {
        return child;
      }
    })
  }
  Object.keys(node.props).forEach(key => {
    if (node.props[key].type === 'innerText') {
      children.push(node.props[key].default)
    }
  })

  const nodeStyle = {
    style: node.props.style || ''
  };
  if (node._meta && node._meta.selected) {
    nodeStyle.style += `border: solid 1px red;`
  }

  return h(node.type, {
    ...node.props,
    ...nodeStyle
  }, children);
}