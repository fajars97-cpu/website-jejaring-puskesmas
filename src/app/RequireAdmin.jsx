// src/app/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading, restoring, adminReady, adminError } = useAuth();
  const location = useLocation();

  // 1) Restore awal saja yang boleh "blocking"
  if (restoring) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memulihkan sesi admin...</div>
      </div>
    );
  }

  // 2) Kalau sudah tidak restoring dan user kosong -> baru redirect
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_logged_in" }} />;
  }

  // 3) Admin check awal: boleh tampilkan loading sekali, tapi jangan nyangkut
  if (loading || !adminReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memverifikasi akses admin...</div>
      </div>
    );
  }

  // 4) timeout/slow: jangan lempar ke login
  const err = String(adminError || "").toLowerCase();
  if (!isAdmin && (err.includes("timeout") || err.includes("verification slow"))) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-sm text-slate-600">
          Sinkron akses admin lebih lama dari biasanya. Coba refresh sekali lagi.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_admin" }} />;
  }

  return children;
}
