// src/app/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading, adminReady, adminError } = useAuth();
  const location = useLocation();

  if (loading || !adminReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memverifikasi akses admin...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_logged_in" }} />;
  }

  // Jika verifikasi lambat/timeout, jangan lempar ke login.
  // Biarkan user stay di halaman (atau refresh) — biasanya cache/retry akan beres.
  const err = String(adminError || "").toLowerCase();
  if (!isAdmin && (err.includes("timeout") || err.includes("verification slow"))) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-sm text-slate-600">
          Memverifikasi akses admin lebih lama dari biasanya. Coba refresh sekali lagi.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_admin" }} />;
  }

  return children;
}
