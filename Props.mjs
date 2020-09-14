import { h } from './vendor/preact.module.js';
import { getSelectedNode, publishComponent, getGeneratedComponents } from './Model.mjs';
import { useState } from './vendor/preacthooks.module.js';

import NewPropForm from './generated/NewPropForm.mjs';

export default function({ $model, $dispatch }) {
  const node = getSelectedNode($model);
  const [name, setName] = useState(null);
  const elements = Object.keys($model._componentregistry)
    .map(key => ({name: key, value: $model._componentregistry[key].component}));

  const propforms = Object.keys($model.arguments)
  .map(prop => ({
    name: prop,
    type: 'string',
    default: $model.arguments[prop]
  }))
  .map(prop => {
    return h(NewPropForm,
      {
        prop,
        setProp: ({ newvalue, oldvalue }) => $dispatch({ action: 'updateProp', payload: { node, newvalue, oldvalue } })
      }
    )
  });

  const attributes = Object.keys(node.attrs)
  .map(attr => ({
    name: attr,
    type: 'string',
    default: node.attrs[attr].value
  }))
  .map(prop => {
    return h(NewPropForm,
      {
        prop,
        setProp: ({ newvalue, oldvalue }) => $dispatch({ action: 'updateAttr', payload: { node, newvalue, oldvalue } })
      }
    )
  })

  return h('div',
  {
    class: 'propsroot'
  },
  [
    h('div',
      null,
      ['Modify component props']
    ),
    h('div',
      null,
      propforms
    ),
    h('button',
      {
        onClick: e => $dispatch({ action: 'addProp', payload: { node } })
      },
      'Add Property'
    ),
    h('div', null, ['Modify element attributes']),
    h('div',
      null,
      attributes
    ),
    h('button',
      {
        onClick: e => $dispatch({ action: 'addAttr', payload: { node } })
      },
      'Add Attribute'
    ),
    h('div',
      {
        class: 'publishcontrols'
      },
      [
        h('input',
          {
            placeholder: 'componentname',
            value: name,
            onChange: e => setName(e.target.value)
          }
        ),
        h('button',
          {
            onClick: e => publishComponent($model, $dispatch, name)
          },
          'Publish'
        ),
      ]
    ),
    h('button',
      {
        onClick: e => getGeneratedComponents($dispatch)
      },
      'Sync'
    )
  ])
}