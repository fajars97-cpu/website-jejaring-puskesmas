import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Konfirmasi",
  description,
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={loading ? undefined : onClose}>
      <div className="text-sm text-slate-700">
        {description || "Apakah Anda yakin?"}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            danger
              ? "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          }
        >
          {loading ? "Memproses…" : confirmText}
        </button>
      </div>
    </Modal>
  );
}
