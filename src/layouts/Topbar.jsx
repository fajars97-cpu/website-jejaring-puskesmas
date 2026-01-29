import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function titleFromPath(pathname) {
  if (pathname.startsWith("/pemohon/mou")) return "Pengajuan MoU";
  if (pathname.startsWith("/admin/permohonan-mou")) return "Rekap Permohonan MoU";
  if (pathname.startsWith("/admin")) return "Dashboard Admin";
  if (pathname.startsWith("/pemohon")) return "Dashboard Pemohon";
  return "Dashboard";
}

export default function Topbar() {
  const { user, signOut } = useAuth();
  const loc = useLocation();
  const title = titleFromPath(loc.pathname);

  return (
    <header className="rounded-2xl bg-emerald-900 text-white shadow-sm ring-1 ring-emerald-900/30">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm/5 font-semibold">{title}</div>
          <div className="text-xs text-emerald-100/80 truncate">
            {loc.pathname}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
            <span className="text-xs text-emerald-100/90 truncate max-w-65">
              {user?.email || "-"}
            </span>
          </div>

          <button
            onClick={signOut}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold ring-1 ring-white/10 hover:bg-white/15 active:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
