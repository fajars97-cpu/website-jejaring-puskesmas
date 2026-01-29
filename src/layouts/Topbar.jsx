import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="text-sm font-medium text-slate-700">
        Dashboard
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500">{user?.email}</span>
        <button
          onClick={signOut}
          className="text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
