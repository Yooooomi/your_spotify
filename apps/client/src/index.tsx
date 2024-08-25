import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import store from "./services/redux";

const element = document.getElementById("root");
const root = createRoot(element!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
