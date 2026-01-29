import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

import { SOCIAL_LINKS, QUICK_LINKS, publicMenu, getSidebarMenu } from "./config/links";
import { getUserLabel } from "./utils/getUserLabel";

export default function Layout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = useMemo(() => getUserLabel(user), [user]);
  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  const showSidebar = !loading && !!user;

  return (
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col">
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
        publicMenu={publicMenu}
        sidebarMenu={sidebarMenu}
        onClose={() => setMobileOpen(false)}
        user={user}
        isAdmin={isAdmin}
        loading={loading}
        userLabel={userLabel}
        onSignOut={signOut}
      />

      {/* MAIN */}
      <main className="flex-1 bg-slate-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={showSidebar ? "md:flex md:gap-6" : ""}>
            {showSidebar ? (
              <Sidebar sidebarMenu={sidebarMenu} userLabel={userLabel} isAdmin={isAdmin} />
            ) : null}

            <div className="min-w-0 flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <Footbar SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
    </div>
  );
}
