// src/app/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading, adminReady, adminError, authPhase } = useAuth();
  const location = useLocation();

  const showOverlay = loading || !adminReady;

  // 1) UX: saat restore / admin-check, JANGAN blank page.
  // Tampilkan children (dim) + overlay ringan supaya tidak terasa "login ulang".
  if (showOverlay) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-60">
          {children}
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
            {authPhase === "restoring" ? "Memulihkan sesi admin…" : "Memverifikasi akses admin…"}
          </div>
        </div>
      </div>
    );
  }

  // 2) Redirect login hanya kalau sudah "ready" dan benar-benar tidak ada user.
  // Ini mencegah mental ke /login saat transisi/refresh.
  if (!user) {
    if (authPhase !== "ready" || loading) {
      // extra safety (harusnya tidak kena karena showOverlay sudah return)
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-sm opacity-70">Memulihkan sesi…</div>
        </div>
      );
    }
    return <Navigate to="/login" replace state={{ from: location, reason: "not_logged_in" }} />;
  }

  // 3) Jika verifikasi lambat/timeout, jangan lempar ke login.
  // Biarkan user stay — biasanya cache/retry akan beres.
  const err = String(adminError || "").toLowerCase();
  if (!isAdmin && (err.includes("timeout") || err.includes("verification slow"))) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-sm text-slate-600">
          Akses admin sedang disinkronkan lebih lama dari biasanya. Coba refresh sekali lagi.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_admin" }} />;
  }

  return children;
}
