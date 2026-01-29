import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../layout/Layout";

// pages (flat)
import Home from "../pages/Home";
import Jejaring from "../pages/Jejaring";
import Perizinan from "../pages/Perizinan";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

import AdminJejaring from "../pages/AdminJejaring";
import AdminPermohonanMoU from "../pages/AdminPermohonanMoU";
import PemohonMoU from "../pages/PemohonMoU";

import NotFound from "../pages/NotFound";

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

function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  return user && isAdmin ? children : <Navigate to="/" replace />;
}

/* =====================
   Routes
===================== */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/jejaring" element={<Jejaring />} />
        <Route path="/perizinan" element={<Perizinan />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
