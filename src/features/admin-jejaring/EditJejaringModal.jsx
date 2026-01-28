import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import JejaringFormFields from "./JejaringFormFields";
import ConfirmDialog from "./ConfirmDialog";
import { CREATE_DEFAULTS } from "./constants";
import { getRowKey, normalizeJejaringPayload, validateJejaring } from "./utils";
import { updateJejaring } from "./api";

export default function EditJejaringModal({ open, row, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(null);

  // confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const key = useMemo(() => (row ? getRowKey(row) : null), [row]);

  useEffect(() => {
    if (!open || !row) return;

    setErr("");
    setConfirmOpen(false);

    // Hydrate dari row + fallback default agar semua field ada
    const initial = {
      ...CREATE_DEFAULTS,

      // identitas
      nama_fasyankes: row?.nama_fasyankes ?? CREATE_DEFAULTS.nama_fasyankes,
      jenis_fasyankes: row?.jenis_fasyankes ?? CREATE_DEFAULTS.jenis_fasyankes,
      tipe_fasyankes: row?.tipe_fasyankes ?? CREATE_DEFAULTS.tipe_fasyankes,
      status: row?.status ?? CREATE_DEFAULTS.status,

      // lokasi
      alamat: row?.alamat ?? CREATE_DEFAULTS.alamat,
      kelurahan: row?.kelurahan ?? CREATE_DEFAULTS.kelurahan,
      kecamatan: row?.kecamatan ?? CREATE_DEFAULTS.kecamatan,
      kota: row?.kota ?? CREATE_DEFAULTS.kota,
      kode_pos: row?.kode_pos ?? CREATE_DEFAULTS.kode_pos,

      // geo
      lat: row?.lat ?? CREATE_DEFAULTS.lat,
      lng: row?.lng ?? CREATE_DEFAULTS.lng,

      // kontak + maps
      telepon: row?.telepon ?? CREATE_DEFAULTS.telepon,
      email: row?.email ?? CREATE_DEFAULTS.email,
      gmaps_url: row?.gmaps_url ?? CREATE_DEFAULTS.gmaps_url,
      gmaps_embed_url: row?.gmaps_embed_url ?? CREATE_DEFAULTS.gmaps_embed_url,

      // admin/meta
      is_verified: row?.is_verified ?? CREATE_DEFAULTS.is_verified,
      penyelenggara: row?.penyelenggara ?? CREATE_DEFAULTS.penyelenggara,
      kelompok_penyelenggara:
        row?.kelompok_penyelenggara ?? CREATE_DEFAULTS.kelompok_penyelenggara,

      // izin + pj
      pj_nama: row?.pj_nama ?? CREATE_DEFAULTS.pj_nama,
      nomor_izin: row?.nomor_izin ?? CREATE_DEFAULTS.nomor_izin,
      izin_mulai: row?.izin_mulai ?? CREATE_DEFAULTS.izin_mulai,
      izin_berakhir: row?.izin_berakhir ?? CREATE_DEFAULTS.izin_berakhir,
      jumlah_sdm: row?.jumlah_sdm ?? CREATE_DEFAULTS.jumlah_sdm,

      // mou
      mou_nomor: row?.mou_nomor ?? CREATE_DEFAULTS.mou_nomor,
      mou_mulai: row?.mou_mulai ?? CREATE_DEFAULTS.mou_mulai,
      mou_akhir: row?.mou_akhir ?? CREATE_DEFAULTS.mou_akhir,

      // akreditasi
      terakreditasi: row?.terakreditasi ?? CREATE_DEFAULTS.terakreditasi,
      nomor_akreditasi: row?.nomor_akreditasi ?? CREATE_DEFAULTS.nomor_akreditasi,
      hasil_akreditasi: row?.hasil_akreditasi ?? CREATE_DEFAULTS.hasil_akreditasi,
      
      // lain-lain
      kegiatan: row?.kegiatan ?? CREATE_DEFAULTS.kegiatan,
      foto: row?.foto ?? CREATE_DEFAULTS.foto,
    };

    setForm(initial);
  }, [open, row]);

  const setField = (k, v) => setForm((p) => ({ ...(p || {}), [k]: v }));

  const cancelEdit = () => {
    // Tidak ada draft. Batal = tutup saja.
    onClose?.();
  };

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

    setConfirmOpen(true);
  }

  async function doSave() {
    if (!row || !form) return;
    if (!key) return;

    const payload = normalizeJejaringPayload(form);

    setSaving(true);
    try {
      await updateJejaring(key.pk, key.value, payload);
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
      <Modal
        open={open}
        title="Edit Jejaring"
        onClose={saving ? undefined : onClose}
      >
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
                onClick={cancelEdit}
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
                {saving ? "Menyimpan…" : "Simpan"}
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
        onClose={saving ? undefined : () => setConfirmOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
