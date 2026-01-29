import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ role }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-350 px-4 py-4">
        <div className="grid grid-cols-[280px_1fr] gap-4">
          <Sidebar role={role} />
          <div className="min-w-0">
            <Topbar />
            <main className="mt-4 min-h-[calc(100vh-140px)] rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
