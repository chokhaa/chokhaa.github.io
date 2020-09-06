// import { createContext } from 'https://unpkg.com/preact@latest?module';

export const initialModel = {
  type: 'div',
  name: 'div',
  props: {},
  _meta: {
    id: 1,
    selected: true
  },
  children: [],
  // TODO: Separate this out using usecontext
  _componentregistry: {
    div: {
      component: 'div',
      props: []
    },
    span: {
      component: 'span',
      props: []
    },
    p: {
      component: 'p',
      props: []
    },
    button: {
      component: 'button',
      props: []
    },
    input: {
      component: 'input',
      props: []
    },
    a: {
      component: 'a',
      props: []
    },
    select: {
      component: 'select',
      props: []
    },
    option: {
      component: 'option',
      props: []
    },
    textarea: {
      component: 'textarea',
      props: []
    }
  }
}

// export default createContext()

export function reducer(state, {action, payload}) {
  switch(action) {
    case 'select':
      return selectNode(state, payload);
    case 'updateNodeType':
      return setNodeType(state, payload);
    case 'addChild':
      return addChild(state, payload);
    case 'applyStyle':
      return setNodeStyle(state, payload);
    case 'registerComponent':
      return addComponent(state, payload);
    case 'addProp':
      return addProp(state, payload);
  }
}

function addComponent(root, { name, renderer }) {
  const _componentregistry = {
    ...root._componentregistry,
    [name]: {
      component: renderer,
      props: []
    }
  };
  return { ...root, _componentregistry }
}

function selectNode(root, node) {
  const id = node._meta.id;
  if (typeof root === 'object') {
    root._meta.selected = root._meta.id === id
    root.children = root.children.map(child => {
      return selectNode(child, node);
    });
    return {...root};
  }
  return root;
}

function setNodeType(root, {node, type}) {
  const id = node._meta.id;
  if (typeof root === 'object' && root._meta.id === id) {
    root.type = type
    return { ...root }
  } else if (typeof root === 'object') {
    const children = root.children.map(child => setNodeType(child, {node, type}));
    return { ...root, children }
  } else {
    return root;
  }
}

function setNodeStyle(root, {node, style}) {
  const id = node._meta.id;
  if (typeof root === 'object' && root._meta.id === id) {
    root.props.style = style
    return { ...root }
  } else if (typeof root === 'object') {
    const children = root.children.map(child => setNodeStyle(child, {node, style}));
    return { ...root, children }
  } else {
    return root;
  }
}

function addProp(root, {node, prop}) {
  const id = node._meta.id;
  const { name } = prop;
  if (typeof root === 'object' && root._meta.id === id) {
    root.props[name] = prop;
    return { ...root }
  } else if (typeof root === 'object') {
    const children = root.children.map(child => addProp(child, {node, prop}));
    return { ...root, children }
  } else {
    return root;
  }
}

function addChild(root, {node, type, name, text}) {
  const id = node._meta.id;
  if (typeof root === 'object' && root._meta.id === id) {
    root.children = [...root.children, { name, type, props: {}, _meta: {id: new Date().getTime()}, children: text ? [text] : []}]
    return { ...root }
  } else if (typeof root === 'object') {
    const children = root.children.map(child => addChild(child, {node, type, name, text}));
    return { ...root, children }
  } else {
    return root;
  }
}

export function getSelectedNode(root) {
  if (root._meta.selected) {
    return root;
  } else {
    const selected = root.children.map(child => {
      if (typeof child === 'object')
        return getSelectedNode(child)
      else
        return null
    }).filter(node => !!node)
    return selected.pop();
  }
}

export function publishComponent(model, dispatch, name) {
  const modelCopy = JSON.parse(JSON.stringify(model));
  delete modelCopy._componentregistry;
  // Publish component
  const network_p = fetch('/components', {
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

  const db_p = saveToDB(model, name);

  return Promise.all([network_p, db_p]);
}

export function getGeneratedComponents(dispatch) {
  return fetch('/components')
  .then(data => data.json())
  .then(list => {
    return Promise.all(list.map(file => import('/generated/' + file)))
    .then(components => [list, components]);
  })
  // Add list to model
  .then(([names, components]) => {
    for (let i = 0; i < names.length; i++)
      dispatch({action: 'registerComponent', payload: { name: names[i], renderer: components[i].default }})
  })
}

function saveToDB(model, filename) {
  return Promise.resolve();
}