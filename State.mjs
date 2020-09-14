import { h } from './vendor/preact.module.js';

export default function State({$model, $dispatch}) {
  return h('textarea', {
    value: JSON.stringify($model.arguments, null, 4),
    style: `width: 100%;
            height: 100%;
            box-sizing: border-box;
            margin: 1px;`
  }, [ ])
}