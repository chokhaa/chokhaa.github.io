import { h } from './vendor/preact.module.js';

export default function({ $model, $dispatch }) {
  return h('div', {}, ['DOM', renderTree($model, $dispatch)]);
}

function renderTree(node, dispatch) {
  let children = []
  if (typeof node.children !== 'string') {
    children = node.children.map(child => {
      if (typeof child === 'string') {
        return h('div', {
          className: 'tree-node tree-node-text'
        } , child);
      } else {
        return renderTree(child, dispatch);
      }
    })
  }

  const treeNode = h('div', {
    className: node._meta.selected ? 'tree-node-name selected' : 'tree-node-name',
    onClick: () => dispatch({ action: 'select', payload: node  })
  }, node.name);

  children.unshift(treeNode);

  return h('div', { className: 'tree-node' }, children);
}
