import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";
import "./styles/themes.css";

import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
       <ThemeProvider>
          <App />

          <Toaster
            richColors
            position="top-right"
            closeButton
          />
       </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);