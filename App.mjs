import { h } from './vendor/preact.module.js';
import { useReducer, useEffect } from './vendor/preacthooks.module.js';
import Preview from './Preview.mjs';
import Tree from './Tree.mjs';
import Props from './Props.mjs';
import Children from './Children.mjs';
import { initialModel, reducer } from "./Model.mjs";

export function App() {

  const [$model, $dispatch] = useReducer(reducer, initialModel);
  return h('div', {
    style: `
      display: grid;
      grid-gap: 1px;
      height: 100vh;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      grid-template-areas:
        "preview props state"
        "preview children tree"
    `
  }, [
    h('div', { style: `grid-area: preview; border: solid 1px;` }, [
      h(Preview,
        {
          $model, $dispatch
        }
    )]),
    h('div', { style: `grid-area: props; border: solid 1px;` }, [h(Props, {$model, $dispatch})]),
    h('div', { style: `grid-area: children; border: solid 1px;` }, [h(Children, {$model, $dispatch})]),
    h('div', { style: `grid-area: state; border: solid 1px;` }, 'state'),
    h('div', { style: `grid-area: tree; border: solid 1px;` }, [
      h(Tree,
        {
          $model, $dispatch
        })
    ])
  ]);
}