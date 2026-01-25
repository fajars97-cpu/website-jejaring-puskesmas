// src/app/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "../app/Layout";
import Home from "../pages/Home";
import Jejaring from "../pages/Jejaring";
import Perizinan from "../pages/Perizinan";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

import RequireAdmin from "./RequireAdmin";
import AdminJejaring from "../pages/AdminJejaring";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Semua halaman yang butuh navbar/footer harus jadi anak Layout */}
      <Route element={<Layout />}>
        {/* Publik (LOCKED) */}
        <Route path="/" element={<Home />} />
        <Route path="/jejaring" element={<Jejaring />} />
        <Route path="/perizinan" element={<Perizinan />} />

        {/* Admin (Protected) - ikut layout */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminJejaring />
            </RequireAdmin>
          }
        />
      </Route>

      {/* Login biasanya tidak perlu navbar (sesuai Layout.jsx kamu yang menu auth cuma "Login") */}
      <Route path="/login" element={<Login />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
