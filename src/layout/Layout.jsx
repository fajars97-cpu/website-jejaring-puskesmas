import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Kamu bisa sesuaikan pattern app area tanpa ubah routing inti
  const isAppArea = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/admin") || p.startsWith("/pemohon") || p.startsWith("/app");
  }, [location.pathname]);

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ESC closes drawer
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  // Swipe gesture state (mobile)
  const touchRef = useRef({
    tracking: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startT: 0,
  });

  const onTouchStart = (e) => {
    if (!e.touches?.length) return;
    const t = e.touches[0];
    touchRef.current = {
      tracking: true,
      startX: t.clientX,
      startY: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
      startT: Date.now(),
    };
  };

  const onTouchMove = (e) => {
    if (!touchRef.current.tracking || !e.touches?.length) return;
    const t = e.touches[0];
    touchRef.current.lastX = t.clientX;
    touchRef.current.lastY = t.clientY;
  };

  const onTouchEnd = () => {
    const s = touchRef.current;
    if (!s.tracking) return;
    s.tracking = false;

    const dx = s.lastX - s.startX;
    const dy = s.lastY - s.startY;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const dt = Date.now() - s.startT;

    // filter noise
    if (dt > 700) return;
    if (ady > 48) return;
    if (adx < 72) return;

    // Open: swipe right from left edge
    if (!mobileOpen && s.startX <= 24 && dx > 0) {
      setMobileOpen(true);
      return;
    }

    // Close: swipe left
    if (mobileOpen && dx < 0) {
      setMobileOpen(false);
    }
  };

  return (
    <div
      className="min-h-dvh bg-slate-50 text-slate-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Shell: page tidak scroll, hanya area tertentu */}
      <div className="h-dvh overflow-hidden">
        {/* Topbar fixed */}
        <div className="sticky top-0 z-50">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
        </div>

        {/* BODY */}
        {isAppArea ? (
          // APP SHELL: sidebar fixed + content scroll + footer fixed
          <div className="grid h-[calc(100dvh-3.5rem)] md:grid-cols-[280px_1fr]">
            {/* Sidebar fixed */}
            <aside className="hidden md:block h-full bg-emerald-800 border-r border-white/10">
              <Sidebar />
            </aside>

            {/* Content column */}
            <section className="relative h-full min-w-0 bg-slate-50">
              {/* Scrollable content area.
                  pb-[56px] biar konten terakhir nggak ketutup footer fixed (tinggi footer app 56px) */}
              <div className="h-full overflow-y-auto pb-[56px]">
                <main className="px-4 py-6 md:px-6">
                  <div className="mx-auto w-full max-w-[1400px]">
                    <Outlet />
                  </div>
                </main>
              </div>

              {/* Footer fixed di bawah kolom konten */}
              <div className="absolute bottom-0 left-0 right-0">
                <Footbar variant="app" />
              </div>
            </section>
          </div>
        ) : (
          // PUBLIC: scroll normal + footer rame ikut scroll
          <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto w-full max-w-[1200px]">
                <Outlet />
              </div>
            </main>

            <Footbar variant="public" />
          </div>
        )}

        {/* Mobile drawer overlay */}
        <Burgerbar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </div>
  );
}
