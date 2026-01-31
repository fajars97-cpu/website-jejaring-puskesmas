import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // PUBLIC hanya 3 halaman ini (sesuai request kamu).
  // Semua selain ini dianggap APP (login/pemohon/admin).
  const isPublic = useMemo(() => {
    const p = location.pathname;
    return p === "/" || p.startsWith("/jejaring") || p.startsWith("/perizinan");
  }, [location.pathname]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  // Swipe gestures for burger
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

    if (dt > 700) return;
    if (ady > 48) return;
    if (adx < 72) return;

    if (!mobileOpen && s.startX <= 24 && dx > 0) setMobileOpen(true);
    if (mobileOpen && dx < 0) setMobileOpen(false);
  };

  return (
    <div
      className="min-h-dvh bg-slate-50 text-slate-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="h-dvh overflow-hidden">
        {/* Topbar fixed */}
        <div className="sticky top-0 z-50">
          <Topbar onMenuClick={() => setMobileOpen(true)} mode={isPublic ? "public" : "app"} />
        </div>

        {isPublic ? (
          // PUBLIC: scroll normal, footer public ikut scroll
          <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto w-full max-w-300">
                <Outlet />
              </div>
            </main>

            {/* Footer PUBLIC (rame) */}
            <Footbar variant="public" />
          </div>
        ) : (
          // APP: sidebar fixed, hanya konten scroll, footer fixed simple
          <div className="grid h-[calc(100dvh-3.5rem)] md:grid-cols-[280px_1fr]">
            <aside className="hidden md:block h-full bg-emerald-800 border-r border-white/10">
              <Sidebar />
            </aside>

            <section className="relative h-full min-w-0">
              <div className="h-full overflow-y-auto pb-14">
                <main className="px-4 py-6 md:px-6">
                  <div className="mx-auto w-full max-w-350">
                    <Outlet />
                  </div>
                </main>
              </div>

              {/* Footer APP (simple fixed) */}
              <div className="absolute bottom-0 left-0 right-0">
                <Footbar variant="app" />
              </div>
            </section>
          </div>
        )}

        <Burgerbar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </div>
  );
}
