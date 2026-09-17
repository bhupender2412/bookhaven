import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";

import "./index.css";

import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />

        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
