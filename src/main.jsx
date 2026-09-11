import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { supabase } from "./lib/supabaseClient.js";
import { isRecoveryUrl, recoveryDestination } from "./lib/recovery.js";

async function start() {
  // Let Supabase consume the token fragment before HashRouter reads the URL.
  if (isRecoveryUrl(window.location.href)) {
    const destination = recoveryDestination(window.location.href);
    await supabase.auth.initialize();
    window.history.replaceState(null, "", destination);
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

start();
