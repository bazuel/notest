//import "./app.scss";
import App from "./components/App.svelte";

const app = setTimeout(
  () =>
    new App({
      target: document.getElementById("--nt-widget"),
    }),
  1000
);

export default app;
