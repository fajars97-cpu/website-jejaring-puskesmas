import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import JejaringFormFields from "./JejaringFormFields";
import ConfirmDialog from "./ConfirmDialog";
import { getRowKey, normalizeJejaringPayload, validateJejaring } from "./utils";
import { updateJejaring } from "./api";

export default function EditJejaringModal({ open, row, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(null);

  // confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);

  React.useEffect(() => {
    if (!open || !row) return;
    setErr("");
    setConfirmOpen(false);
    setForm({
      nama_fasyankes: row?.nama_fasyankes ?? "",
      alamat: row?.alamat ?? "",
      kelurahan: row?.kelurahan ?? "",
      kecamatan: row?.kecamatan ?? "Jagakarsa",
      telepon: row?.telepon ?? "",
      email: row?.email ?? "",
      lat: row?.lat ?? "",
      lng: row?.lng ?? "",
    });
  }, [open, row]);

  const key = useMemo(() => (row ? getRowKey(row) : null), [row]);
  const setField = (k, v) => setForm((p) => ({ ...(p || {}), [k]: v }));

  function requestSave(e) {
    e.preventDefault();
    setErr("");

    if (!row || !form) return;

    if (!key) {
      setErr("Tidak menemukan primary key (id/uuid) untuk row ini.");
      return;
    }

    const v = validateJejaring(form);
    if (v) {
      setErr(v);
      return;
    }

    // valid -> minta konfirmasi
    setConfirmOpen(true);
  }

  async function doSave() {
    if (!row || !form) return;
    const k = key;
    if (!k) return;

    const payload = normalizeJejaringPayload(form);

    setSaving(true);
    try {
      await updateJejaring(k.pk, k.value, payload);
      await onSaved?.();
      setConfirmOpen(false);
      onClose?.();
    } catch (e2) {
      setErr(e2?.message || "Gagal menyimpan perubahan.");
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal open={open} title="Edit Jejaring" onClose={saving ? undefined : onClose}>
        {!form ? (
          <div className="text-sm text-slate-600">Menyiapkan form…</div>
        ) : (
          <form onSubmit={requestSave} className="space-y-3">
            <JejaringFormFields value={form} onChange={setField} />

            {err ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <span className="font-semibold">Gagal:</span> {err}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Konfirmasi Simpan"
        description="Yakin simpan perubahan data jejaring ini?"
        confirmText="Ya, simpan"
        cancelText="Batal"
        loading={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
