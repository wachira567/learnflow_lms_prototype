import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";

// Suppress React Router v7 deprecation warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes?.("React Router Future Flag Warning") ||
    args[0]?.includes?.("v7_startTransition") ||
    args[0]?.includes?.("v7_relativeSplatPath")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
