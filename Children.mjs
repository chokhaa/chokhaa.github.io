import { h } from './vendor/preact.module.js';
import { useState } from './vendor/preacthooks.module.js';
import { getSelectedNode } from './Model.mjs';
export default function({ $model, $dispatch }) {
  const node = getSelectedNode($model);
  const [type, setType] = useState('div');
  const [text, setText] = useState(null);
  const elements = Object.keys($model._componentregistry);
  return h('div', null, [
    h('div',
      null,
      ['Add children here']
    ),
    h('select', {
      value: type,
      onChange: ev => setType(ev.target.value)
    }, [
      elements.map(el => h('option', { value: el }, el))
    ]),
    h('input', {
      value: text,
      onChange: ev => setText(ev.target.value)
    }),
    h('button',
      {
        onClick: e => {
          $dispatch({
            action: 'addChild',
            payload: {
              node,
              type: $model._componentregistry[type].component,
              name: type,
              text
            }
          })
        }
      },
      ['Add']
    ),
    h('div',
      {},
      [
        'Props ',
        h('div',
          null,
          [
            h('span', null, 'propname:'),
            h('input', { placeholder: 'path to parent value to bind', style: 'margin-left: 10px' }),
            h('input', { placeholder: 'fixed value', style: 'margin-left: 10px' })
          ]
        )
      ]
    )
  ])
}