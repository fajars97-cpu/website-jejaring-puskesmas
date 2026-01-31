import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminAccounts() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [disabled, setDisabled] = useState("all"); // all | active | disabled
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const disabledParam = useMemo(() => {
    if (disabled === "all") return null;
    return disabled === "disabled";
  }, [disabled]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase.rpc("admin_list_accounts", {
        p_q: q?.trim() ? q.trim() : null,
        p_disabled: disabledParam,
        p_limit: 50,
        p_offset: 0,
      });
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat akun.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggleDisable(row) {
    const next = !row.is_disabled;
    const reason =
      next ? window.prompt("Alasan disable (opsional):", row.disabled_reason || "") : null;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("admin_set_user_disabled", {
        p_target_id: row.user_id,
        p_disabled: next,
        p_reason: reason,
      });
      if (error) throw error;
      await load();
    } catch (e) {
      alert(e?.message || "Gagal update status akun.");
    } finally {
      setLoading(false);
    }
  }

  async function onEditNotes(row) {
    const notes = window.prompt("Notes untuk pemohon (akan bisa dilihat pemohon):", row.notes || "");
    if (notes === null) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("admin_update_user_notes", {
        p_target_id: row.user_id,
        p_notes: notes,
      });
      if (error) throw error;
      await load();
    } catch (e) {
      alert(e?.message || "Gagal update notes.");
    } finally {
      setLoading(false);
    }
  }

  async function onForceLogout(row) {
    if (!window.confirm("Force logout user ini dari semua device?")) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-force-logout", {
        body: { target_user_id: row.user_id },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error("Force logout gagal.");
      alert("OK: user sudah dikeluarkan dari semua sesi.");
    } catch (e) {
      alert(e?.message || "Gagal force logout.");
    } finally {
      setLoading(false);
    }
  }

  async function onSendReset(row) {
    if (!row.email) {
      alert("Email user belum tersedia. Pastikan kolom profiles.email sudah terisi.");
      return;
    }
    if (!window.confirm(`Kirim email reset password ke:\n${row.email}?`)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-send-reset", {
        body: { target_user_id: row.user_id, email: row.email },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error("Reset email gagal terkirim.");
      alert("OK: email reset password terkirim.");
    } catch (e) {
      alert(e?.message || "Gagal kirim reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-none px-0 md:px-1 py-0">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-extrabold">Pengelolaan Akun</div>
              <div className="text-sm text-black/60">
                Super admin dapat disable akun, force logout, kirim reset password, dan menulis notes.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / email / user_id..."
                className="h-10 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30 sm:w-[320px]"
              />
              <select
                value={disabled}
                onChange={(e) => setDisabled(e.target.value)}
                className="h-10 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="disabled">Disabled</option>
              </select>
              <button
                onClick={load}
                className="h-10 rounded-xl border border-black/15 bg-white px-4 text-sm font-semibold hover:bg-black/3"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
            <div className="overflow-x-auto">
              <table className="min-w-225 w-full text-left text-sm">
                <thead className="bg-black/3 text-xs font-bold text-black/70">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.length ? (
                    rows.map((r) => (
                      <tr key={r.user_id} className="border-t border-black/10">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{r.nama || "-"}</div>
                          <div className="text-xs text-black/55">{r.email || r.user_id}</div>
                        </td>
                        <td className="px-4 py-3">{r.role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                              r.is_disabled
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                            ].join(" ")}
                          >
                            {r.is_disabled ? "Disabled" : "Aktif"}
                          </span>
                          {r.is_disabled && r.disabled_reason ? (
                            <div className="mt-1 text-xs text-black/55">{r.disabled_reason}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="line-clamp-2 text-xs text-black/70">{r.notes || "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => onEditNotes(r)}
                              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/3"
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => onToggleDisable(r)}
                              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/3"
                            >
                              {r.is_disabled ? "Enable" : "Disable"}
                            </button>
                            <button
                              onClick={() => onForceLogout(r)}
                              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/3"
                            >
                              Force Logout
                            </button>
                            <button
                              onClick={() => onSendReset(r)}
                              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-black/10">
                      <td className="px-4 py-6 text-sm text-black/60" colSpan={5}>
                        {loading ? "Memuat data..." : "Tidak ada data."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-xs text-black/50">
            Catatan: tombol reset password butuh <code>profiles.email</code> terisi.
          </div>
        </div>
      </div>
    </div>
  );
}
