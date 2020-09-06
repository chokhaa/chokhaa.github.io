import { h } from './vendor/preact.module.js';
import { getSelectedNode, publishComponent, getGeneratedComponents } from './Model.mjs';
import { useState } from './vendor/preacthooks.module.js';

import NewPropForm from './generated/NewPropForm.mjs';

export default function({ $model, $dispatch }) {
  const node = getSelectedNode($model);
  const [name, setName] = useState(null);
  const elements = Object.keys($model._componentregistry)
    .map(key => ({name: key, value: $model._componentregistry[key].component}));
  return h('div',
  {
    class: 'propsroot'
  },
  [
    h('div',
      null,
      ['Modify selected components props']
    ),
    h('select',
      {
        value: node.type,
        onChange: e => $dispatch({ action: 'updateNodeType', payload: { node, type: e.target.value } })
      },
      [
        elements.map(el => h('option', { value: el.value }, el.name))
      ]
    ),
    h('textarea',
      {
        placeholder: 'add css here',
        value: $model.props.style,
        onChange: e => $dispatch({action: 'applyStyle', payload: { node, style: e.target.value }})
      }
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
    h(NewPropForm,
      {
        onAdd: prop => $dispatch({ action: 'addProp', payload: { node, prop } })
      },
      []
    ),
    h('button',
      {
        onClick: e => getGeneratedComponents($dispatch)
      },
      'Sync'
    )
  ])
}