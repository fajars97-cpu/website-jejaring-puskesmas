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

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  const showSidebar = !loading && !!user;
  const isAppArea = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/pemohon");

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

      {/* Shell: viewport - topbar (4rem) */}
      <div className="h-[calc(100dvh-4rem)] bg-slate-50 overflow-hidden">
        {/* PUBLIC: one-column scroll */}
        {!isAppArea ? (
          <div className="h-full overflow-y-auto">
            <main className="px-4 py-8 md:px-6">
              <div className="mx-auto max-w-6xl">
                <Outlet />
                <div className="mt-12">
                  <Footbar SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
                </div>
              </div>
            </main>
          </div>
        ) : (
          /* APP: sidebar fixed, content scroll */
          <div className="mx-auto max-w-6xl h-full px-4 md:px-6">
            <div className={showSidebar ? "grid h-full md:grid-cols-[260px_1fr] md:gap-6" : "h-full"}>
              {/* Sidebar stays still */}
              {showSidebar ? (
                <div className="hidden md:block h-full py-6">
                  <Sidebar sidebarMenu={sidebarMenu} isAdmin={isAdmin} />
                </div>
              ) : null}

              {/* Only this scrolls */}
              <div className="min-w-0 h-full overflow-y-auto py-6">
                <Outlet />
                <div className="mt-12">
                  <Footbar SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
