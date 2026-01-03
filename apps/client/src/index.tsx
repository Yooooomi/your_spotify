import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import store from "./services/redux";
import "./index.css";

const element = document.getElementById("root");
const root = ReactDOM.createRoot(element!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
