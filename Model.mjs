let db = null;
const primitives = ['div', 'a', 'p', 'span', 'button', 'input', 'select', 'option', 'textarea', 'img'];
export const initialModel = {
  arguments: {},
  vdom: {
    name: 'div',
    renderer: 'div',
    attrs: {},
    _meta: {
      id: 1,
      selected: true
    },
    children: []
  },
  // TODO: Separate this out using usecontext
  _componentregistry: primitives.reduce((reg, prim) => {
    reg[prim] = {
      renderer: prim,
      props: {}
    };
    return reg;
  }, {})
}

export function reducer(state, {action, payload}) {
  switch(action) {
    case 'select':
      return selectNode(state, payload);
    case 'delete':
      return deleteNode(state, payload);
    case 'addChild':
      return addChild(state, payload);
    case 'registerComponent':
      return addComponent(state, payload);
    case 'addAttr':
      return addAttr(state, payload);
    case 'addProp':
      return addProp(state, payload);
    case 'updateProp':
      return updateProp(state, payload);
    case 'updateAttr':
      return updateAttr(state, payload);
  }
}

function addComponent(root, { name, renderer, props }) {
  const _componentregistry = {
    ...root._componentregistry,
    [name]: {
      renderer,
      props: props || {}
    }
  };
  return { ...root, _componentregistry }
}

function selectNode(state, node) {
  const id = node._meta.id;
  const vdom = selectNodeRecursively(state.vdom, id);
  return { ...state, vdom };
}

function selectNodeRecursively(root, id) {
  if (typeof root === 'object') {
    root._meta.selected = root._meta.id === id;
    root.children = root.children.map(child => {
      return selectNodeRecursively(child, id);
    });
    return root;
  }
  return root;
}

function deleteNode(state, node) {
  const id = node._meta.id;
  if (state.vdom._meta.id === id) {
    alert('Cnnot delete root node!')
    return state;
  }
  const vdom = deleteNodeRecursively(state.vdom, id);
  return { ...state, vdom };
}

function deleteNodeRecursively(root, id) {
  if (typeof root === 'object') {
    root.children = root.children.filter(child => child._meta.id !== id);
    root.children = root.children.map(child => {
      return deleteNodeRecursively(child, id);
    });
    return root;
  }
  return root;
}

function updateProp(state, { node, oldvalue, newvalue }) {
  const newstate = { ...state };
  if (newvalue.name !== oldvalue.name) {
    delete newstate.arguments[oldvalue.name]
  }
  newstate.arguments[newvalue.name] = newvalue.default;
  return newstate;
}

function updateAttr(state, { node, oldvalue, newvalue }) {
  const vdom = recursiveUpdateAttr(state.vdom, { node, oldvalue, newvalue });
  return { ...state, vdom };
}

function recursiveUpdateAttr(vnode, { node, oldvalue, newvalue }) {
  if (vnode._meta.id === node._meta.id) {
    if (oldvalue.name !== newvalue.name) {
      delete vnode.attrs[oldvalue.name];
    }
    vnode.attrs[newvalue.name] = newvalue;
  } else {
    vnode.children = vnode.children.map(child => recursiveUpdateAttr(child, { node, oldvalue, newvalue }));
  }
  return vnode;
}

function addProp(state, {node}) {
  const id = node._meta.id;
  const args = {
    ...state.arguments,
    _new_prop_: ''
  };
  return { ...state, arguments: args };
}

function addAttr(state, { node }) {
  const vdom = recursiveAddAttr(state.vdom, node);
  return {
    ...state,
    vdom
  };
}

function recursiveAddAttr(vnode, node) {
  let newnode = { ...vnode };
  if (vnode._meta.id === node._meta.id) {
    newnode.attrs['new-attr'] = '`dummyvalue`';
  } else {
    newnode.children = newnode.children.map(child => {
      return recursiveAddAttr(child, node);
    })
  }
  return newnode;
}

function addChild(state, {node, renderer, name, attrs}) {
  const vdom = recursiveAddChild(state.vdom, { node, renderer, name, attrs });
  return {
    ...state,
    vdom
  };
}

function recursiveAddChild(root, { node, renderer, name, attrs }) {
  const id = node._meta.id;
  if (typeof root === 'object' && root._meta.id === id) {
    root.children = [
      ...root.children,
      {
        name,
        renderer,
        attrs,
        _meta: {
          id: new Date().getTime()
        },
        children: []
      }
    ]
    return { ...root }
  } else if (typeof root === 'object') {
    const children = root.children.map(child => recursiveAddChild(child, {node, renderer, name}));
    return { ...root, children }
  } else {
    return root;
  }
}

export function getSelectedNode(state) {
  return recursiveFindSelectedNode(state.vdom);
}

function recursiveFindSelectedNode(root) {
  if (root._meta.selected) {
    return root;
  } else {
    const selected = root.children.map(child => {
      if (typeof child === 'object')
        return recursiveFindSelectedNode(child)
      else
        return null
    }).filter(node => !!node)
    return selected.pop();
  }
}

export function publishComponent(model, dispatch, name) {
  const modelCopy = JSON.parse(JSON.stringify(model));
  // Publish component
  return fetch('/components', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelCopy,
      filename: name + '.mjs'
    })
  })
  // Get list of components
  .then(() => getGeneratedComponents(dispatch))
}

export function getGeneratedComponents(dispatch) {
  return fetch('/components')
  .then(data => data.json())
  .then(list => {
    return Promise.all(list.map(doc => import('/generated/' + doc._id)))
    .then(components => [list, components]);
  })
  // Add list to model
  .then(([list, components]) => {
    for (let i = 0; i < list.length; i++)
      dispatch({
        action: 'registerComponent',
        payload: {
          name: list[i]._id,
          renderer: components[i].default,
          props: list[i].model.arguments
        }
      })
  })
}