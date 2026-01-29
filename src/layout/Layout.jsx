import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

import { publicMenu, SOCIAL_LINKS, QUICK_LINKS, getSidebarMenu } from "./config/links";
import { getUserLabel } from "./utils/getUserLabel";

// ⚠️ sesuaikan kalau lokasi AuthContext beda
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const loc = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  const showSidebar = !loading && !!user;

  // App area: admin/pemohon (dashboard style)
  const isAppArea = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/pemohon");

  // Footer default: tampil di public, disembunyikan di app area biar clean
  const showFooter = !isAppArea;

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      {/* TOPBAR (selalu ada) */}
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

      {/* BURGERBAR (mobile drawer) */}
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

      {/* SHELL: height = viewport - topbar */}
      <div className="h-[calc(100dvh-4rem)] bg-slate-50">
        {/* Public pages: normal flow + footer */}
        {!isAppArea ? (
          <div className="h-full overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto max-w-6xl">
                <Outlet />
              </div>
            </main>

            {showFooter ? <Footbar SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} /> : null}
          </div>
        ) : (
          /* App pages (admin/pemohon): sidebar fixed + content scroll only */
          <div className="mx-auto max-w-6xl h-full px-4 md:px-6">
            <div className={showSidebar ? "grid h-full md:grid-cols-[240px_1fr] md:gap-6" : "h-full"}>
              {/* Sidebar column */}
              {showSidebar ? (
                <div className="hidden md:block h-full py-6">
                  {/* Sidebar should be full height inside this column */}
                  <Sidebar sidebarMenu={sidebarMenu} isAdmin={isAdmin} />
                </div>
              ) : null}

              {/* Content column (scroll only here) */}
              <div className="min-w-0 h-full overflow-y-auto py-6">
                <Outlet />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
