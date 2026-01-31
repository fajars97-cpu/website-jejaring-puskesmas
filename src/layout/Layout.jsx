import React, { useMemo, useState } from "react";
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

  // APP area = route kerja (sidebar + footer simple)
  const isAppArea = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/pemohon");

  // Sidebar hanya muncul ketika user login dan berada di app area
  const showSidebar = !loading && !!user && isAppArea;

  // Menu sidebar (admin vs pemohon)
  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  return (
    <div className="min-h-dvh bg-white text-slate-900">
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
        // Topbar full-width hanya ketika di APP area (setelah login & masuk dashboard)
        isAppChrome={!!user && isAppArea}
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

      {/* Viewport - topbar (h-16) */}
      <div className="h-[calc(100dvh-4rem)] bg-slate-50 overflow-hidden">
        {/* ========= PUBLIC (Home/Jejaring/Perizinan/Login) ========= */}
        {!isAppArea ? (
          <div className="h-full overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto max-w-6xl">
                <Outlet />
              </div>
            </main>

            {/* Footer PUBLIC (rame) */}
            <Footbar variant="public" SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
          </div>
        ) : (
          /* ========= APP (Admin/Pemohon) ========= */
          <div className={showSidebar ? "grid h-full md:grid-cols-[280px_1fr]" : "h-full"}>
            {/* Sidebar fixed (desktop) */}
            {showSidebar ? (
              <aside className="hidden md:block h-full bg-emerald-900 border-r border-white/10">
                <div className="h-full p-5">
                  <Sidebar sidebarMenu={sidebarMenu} isAdmin={isAdmin} />
                </div>
              </aside>
            ) : null}

            {/* Content column scroll ONLY + footer simple fixed */}
            <section className="relative min-w-0 h-full">
              {/* scroll area: padding bottom supaya tidak ketutup footer fixed */}
              <div className="h-full overflow-y-auto pb-[56px]">
                <main className="px-4 py-6 md:px-6">
                  {/* Di app area, biarin konten “lapang” (nggak harus max-w super ketat) */}
                  <div className="mx-auto w-full max-w-6xl">
                    <Outlet />
                  </div>
                </main>
              </div>

              {/* Footer APP simple fixed (ini yang sebelumnya belum muncul di admin) */}
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
