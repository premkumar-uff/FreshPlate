import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FreshPlateProvider } from "./state/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <FreshPlateProvider>
        <App />
      </FreshPlateProvider>
    </BrowserRouter>
  </React.StrictMode>
);
