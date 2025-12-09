import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import LoginRouter from "./LoginRouter";
import "./index.css";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <LoginRouter />
  </Provider>
);
