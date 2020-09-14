import { h } from './vendor/preact.module.js';
import { useState } from './vendor/preacthooks.module.js';
import { getSelectedNode } from './Model.mjs';
export default function({ $model, $dispatch }) {
  const node = getSelectedNode($model);
  const [type, setType] = useState('div');
  const [text, setText] = useState(null);
  const elements = Object.keys($model._componentregistry);

  const props = $model._componentregistry[type].props;

  const renderedProps = Object.keys(props).map(prop => {
    return h('span', { style: 'display: flex;' }, [
      prop,
      h('input', { placeholder: 'path to parent value to bind', style: 'margin-left: 10px' }),
      h('input', { placeholder: 'fixed value', style: 'margin-left: 10px', value: props[prop].default })
    ]);
  });

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
    h('button',
      {
        onClick: e => {
          const attrs = $model._componentregistry[type].props;
          Object.keys(attrs).forEach(attr => {
            attrs[attr] = { value: attrs[attr] };
          });
          $dispatch({
            action: 'addChild',
            payload: {
              node,
              renderer: $model._componentregistry[type].renderer,
              name: type,
              attrs
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
          renderedProps
        )
      ]
    )
  ])
}