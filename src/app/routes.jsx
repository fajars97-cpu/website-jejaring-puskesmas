// src/app/routes.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Layout from "../app/Layout";
import Home from "../pages/Home";
import Jejaring from "../pages/Jejaring";
import Perizinan from "../pages/Perizinan";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

import RequireAdmin from "./RequireAdmin";
import PemohonMoU from "../pages/PemohonMoU";
import AdminPermohonanMoU from "../pages/AdminPermohonanMoU";
import AdminJejaring from "../pages/AdminJejaring"; // pastikan path benar

import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm opacity-70">Memuat…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc, reason: "not_logged_in" }} />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Semua halaman (termasuk login) ikut Layout supaya navbar+footer tampil */}
      <Route element={<Layout />}>
        {/* Publik */}
        <Route path="/" element={<Home />} />
        <Route path="/jejaring" element={<Jejaring />} />
        <Route path="/perizinan" element={<Perizinan />} />

        {/* Login (ikut Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<Login mode="admin" />} />

        {/* Pemohon */}
        <Route
          path="/pemohon/mou"
          element={
            <RequireAuth>
              <PemohonMoU />
            </RequireAuth>
          }
        />

        {/* Admin Jejaring */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminJejaring />
            </RequireAdmin>
          }
        />

        {/* Super Admin - Rekap Permohonan MoU */}
        <Route
          path="/admin/permohonan-mou"
          element={
            <RequireAdmin requireSuperAdmin>
              <AdminPermohonanMoU />
            </RequireAdmin>
          }
        />

        {/* Fallback di dalam layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
