import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

import { publicMenu, SOCIAL_LINKS, QUICK_LINKS, getSidebarMenu } from "./config/links";
import { getUserLabel } from "./utils/getUserLabel";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const loc = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const touchRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startT: 0,
    tracking: false,
  });

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  const isAppArea = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/pemohon");
  const showSidebar = !loading && !!user && isAppArea;

  useEffect(() => setMobileOpen(false), [loc.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  const onTouchStart = (e) => {
    if (!e.touches?.length) return;
    const t = e.touches[0];
    touchRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
      startT: Date.now(),
      tracking: true,
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
      className="min-h-dvh bg-white text-slate-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Topbar
        publicMenu={publicMenu}
        user={user}
        isAdmin={isAdmin}
        loading={loading}
        userLabel={userLabel}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={signOut}
      />

      <Burgerbar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        publicMenu={publicMenu}
        sidebarMenu={sidebarMenu}
        user={user}
        isAdmin={isAdmin}
        loading={loading}
        userLabel={userLabel}
        onSignOut={signOut}
      />

      {/* Viewport minus topbar (h-16 = 4rem) */}
      <div className="h-[calc(100dvh-4rem)] bg-slate-50 overflow-hidden">
        {!isAppArea ? (
          // ===== PUBLIC =====
          <div className="h-full overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto max-w-6xl">
                <Outlet />
              </div>
            </main>

            {/* Footer rame (PUBLIC) */}
            <Footbar variant="public" SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
          </div>
        ) : (
          // ===== APP =====
          <div className={showSidebar ? "grid h-full md:grid-cols-[260px_1fr]" : "h-full"}>
            {showSidebar ? (
              <aside className="hidden md:block h-full bg-emerald-900 border-r border-white/10">
                <div className="h-full p-4 md:p-6">
                  <Sidebar sidebarMenu={sidebarMenu} isAdmin={isAdmin} />
                </div>
              </aside>
            ) : null}

            {/* Content column: scroll only here, footer fixed */}
            <section className="relative min-w-0 h-full">
              <div className="h-full overflow-y-auto pb-14">
                <main className="px-4 py-6 md:px-6">
                  <div className="max-w-6xl">
                    <Outlet />
                  </div>
                </main>
              </div>

              <div className="absolute bottom-0 left-0 right-0">
                <Footbar variant="app" />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
