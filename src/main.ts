import './style.css';
import { mountApp } from './app';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('App root was not found.');
}

const cleanup = mountApp(root);

if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
