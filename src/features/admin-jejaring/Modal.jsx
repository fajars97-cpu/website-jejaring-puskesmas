import React, { useEffect, useRef } from "react";

export default function Modal({ open, title, children, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    // focus panel
    setTimeout(() => panelRef.current?.focus?.(), 0);

    // lock body scroll (biar gak “stuck” / background ikut gerak)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* container */}
      <div className="relative z-10 flex h-full w-full items-start justify-center px-4 py-6">
        <div
          ref={panelRef}
          tabIndex={-1}
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl outline-none"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>

          {/* IMPORTANT: scroll area */}
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
