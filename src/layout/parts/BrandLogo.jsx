import React from "react";

const BASE = import.meta.env.BASE_URL; // penting untuk deploy subpath (GitHub Pages)

export default function BrandLogo() {
  const src = `${BASE}icons/logo-puskesmas-jagakarsa.png`;

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
      <img
        src={src}
        alt="Puskesmas Jagakarsa"
        className="h-full w-full object-contain p-1.5"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const p = e.currentTarget.parentElement;
          if (!p) return;
          p.classList.add("flex", "items-center", "justify-center", "text-xs", "font-bold", "text-white/80");
          p.textContent = "PJ";
        }}
      />
    </div>
  );
}
