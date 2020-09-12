import { h, render } from './vendor/preact.module.js';
import { App } from "./App.mjs";
navigator.serviceWorker.register("/scriptprovider.js");
render(h(App), document.body);