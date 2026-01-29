import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Burgerbar from "./Burgerbar";
import Footbar from "./Footbar";

import { publicMenu, SOCIAL_LINKS, QUICK_LINKS, getSidebarMenu } from "./config/links";
import { getUserLabel } from "./utils/getUserLabel";

// ⚠️ Sesuaikan path ini kalau auth context kamu beda
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  // grouped menu untuk sidebar/burgerbar
  const sidebarMenu = useMemo(() => {
    if (!user) return [];
    return getSidebarMenu({ isAdmin });
  }, [user, isAdmin]);

  // Sidebar hanya tampil untuk user login (admin/pemohon)
  const showSidebar = !loading && !!user;

  return (
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col">
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

      {/* BURGERBAR = Mobile Drawer (topbar controls + sidebar nav) */}
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

      {/* MAIN */}
      <main className="flex-1 bg-slate-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={showSidebar ? "md:flex md:gap-6" : ""}>
            {showSidebar ? <Sidebar sidebarMenu={sidebarMenu} isAdmin={isAdmin} /> : null}

            <div className="min-w-0 flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER (selalu ada) */}
      <Footbar SOCIAL_LINKS={SOCIAL_LINKS} QUICK_LINKS={QUICK_LINKS} />
    </div>
  );
}
