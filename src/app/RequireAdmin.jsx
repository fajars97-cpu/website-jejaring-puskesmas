import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RequireAdmin (UX-safe)
 * - Setelah "granted" sekali, JANGAN unmount children lagi saat background auth refresh.
 * - Kalau sedang syncing, tampilkan overlay kecil, tapi children tetap mount.
 */
export default function RequireAdmin({ children }) {
  const {
    user,
    isAdmin,
    loading,
    adminReady,
    adminError,
    restoring,   // kalau kamu punya flag restore awal
    bgSyncing,   // opsional, kalau ada
  } = useAuth();

  const location = useLocation();

  // Sticky permission: once granted, keep it to prevent form reset
  const grantedRef = useRef(false);

  useEffect(() => {
    if (user && isAdmin && adminReady) {
      grantedRef.current = true;
    }
    // kalau user benar-benar logout, reset granted
    if (!user) {
      grantedRef.current = false;
    }
  }, [user, isAdmin, adminReady]);

  // 1) Restore awal: boleh blocking (first load only)
  if (restoring) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memulihkan sesi admin…</div>
      </div>
    );
  }

  // 2) Kalau belum pernah granted dan belum ada user => redirect login
  if (!user && !grantedRef.current) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_logged_in" }} />;
  }

  // 3) Kalau belum pernah granted dan masih verifikasi => blocking
  if (!grantedRef.current && (loading || !adminReady)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memverifikasi akses admin…</div>
      </div>
    );
  }

  // 4) Kalau belum pernah granted dan ternyata bukan admin => redirect
  if (!grantedRef.current && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location, reason: "not_admin" }} />;
  }

  // 5) Setelah granted: ALWAYS render children (no unmount)
  // Jika sedang sync (background), cukup overlay kecil non-blocking
  const showSyncOverlay =
    grantedRef.current &&
    (bgSyncing || loading || !adminReady) &&
    // jangan spam overlay untuk kasus error minor
    !String(adminError || "").toLowerCase().includes("not_admin");

  return (
    <div className="relative">
      {children}

      {showSyncOverlay && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-xs shadow-sm backdrop-blur">
          Menyinkronkan sesi…
        </div>
      )}
    </div>
  );
}
