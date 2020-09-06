import { h, render } from './vendor/preact.module.js';
import { App } from "./App.mjs";
render(h(App), document.body);
console.log(h, render)