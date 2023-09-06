import '../app.scss';
import App from './components/App.svelte';

const app = new App({
  target: document.querySelector('notest-widget').shadowRoot.getElementById('--nt-widget')
});

export default app;
