import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../layout/Layout";

// pages (flat)
const Home = lazy(() => import("../pages/Home"));
const Jejaring = lazy(() => import("../pages/Jejaring"));
const Perizinan = lazy(() => import("../pages/Perizinan"));

const Login = lazy(() => import("../pages/Login"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Signup = lazy(() => import("../pages/Signup"));

const AdminJejaring = lazy(() => import("../pages/AdminJejaring"));
const AdminPermohonanMoU = lazy(() => import("../pages/AdminPermohonanMoU"));
const PemohonMoU = lazy(() => import("../pages/PemohonMoU"));
const AdminAccounts = lazy(() => import("../pages/AdminAccounts"));
const PemohonProfile = lazy(() => import("../pages/PemohonProfile"));

const NotFound = lazy(() => import("../pages/NotFound"));

// ⚠️ Sesuaikan ini kalau file context kamu beda lokasinya:
import { useAuth } from "../context/AuthContext";

/* =====================
   Guards (minimal, no refactor besar)
===================== */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children, requireSuperAdmin = false }) {
  const { user, isAdmin, isSuperAdmin, loading, adminReady } = useAuth();
  if (loading || !adminReady) return null;
  return user && (requireSuperAdmin ? isSuperAdmin : isAdmin) ? children : <Navigate to="/" replace />;
}

/* =====================
   Routes
===================== */
export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600" role="status">Memuat halaman...</div>}>
    <Routes>
      <Route element={<Layout />}>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/jejaring" element={<Jejaring />} />
        <Route path="/perizinan" element={<Perizinan />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<Login mode="admin" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<Navigate to="/admin/jejaring" replace />} />
        <Route path="/signup" element={<Signup />} />

        {/* PEMOHON */}
        <Route
          path="/pemohon/mou"
          element={
            <RequireAuth>
              <PemohonMoU />
            </RequireAuth>
          }
        />

        <Route
          path="/pemohon/profile"
          element={
            <RequireAuth>
              <PemohonProfile />
            </RequireAuth>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/permohonan-mou"
          element={
            <RequireAdmin>
              <AdminPermohonanMoU />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/jejaring"
          element={
            <RequireAdmin>
              <AdminJejaring />
            </RequireAdmin>
          }
        />

        {/* ADMIN - ACCOUNTS */}
        <Route
          path="/admin/accounts"
          element={
            <RequireAdmin requireSuperAdmin>
              <AdminAccounts />
            </RequireAdmin>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
