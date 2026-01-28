import { useEffect, useMemo, useRef, useState } from "react";
import { PAGE_SIZE } from "./constants";
import { listJejaring } from "./api";

/**
 * UX Goal:
 * - Ganti tab / balik page admin: tampil cepat dari cache (tanpa loading besar).
 * - Fetch Supabase tetap jalan, tapi "silent" (background) kalau data cache sudah ada.
 * - Loading besar hanya untuk:
 *    1) first load tanpa cache
 *    2) manual refresh / action (isRefresh: true)
 */

const CACHE_KEY = "jp_admin_jejaring_list_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

function makeRangeKey(range) {
  return `${range.from}:${range.to}`;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const ts = Number(parsed.ts || 0);
    if (!ts || Date.now() - ts > CACHE_TTL_MS) return null;

    // shape: { ts, pages: { [rangeKey]: { rows, count } } }
    if (!parsed.pages || typeof parsed.pages !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rangeKey, rows, count) {
  try {
    const current = readCache() || { ts: Date.now(), pages: {} };
    const next = {
      ts: Date.now(),
      pages: {
        ...(current.pages || {}),
        [rangeKey]: {
          rows: Array.isArray(rows)
            ? rows.map((r) => ({
                ...r,
                // kolom baru: aman kalau cache lama belum punya
                terakreditasi: r?.terakreditasi ?? false,
                nomor_akreditasi: r?.nomor_akreditasi ?? null,
                hasil_akreditasi: r?.hasil_akreditasi ?? null,
              }))
            : [],
          count: Number(count || 0),
        },
      },
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function readPageFromCache(rangeKey) {
  const c = readCache();
  if (!c?.pages?.[rangeKey]) return null;
  const p = c.pages[rangeKey];
  return {
    ...p,
    rows: Array.isArray(p?.rows)
      ? p.rows.map((r) => ({
          ...r,
          terakreditasi: r?.terakreditasi ?? false,
          nomor_akreditasi: r?.nomor_akreditasi ?? null,
          hasil_akreditasi: r?.hasil_akreditasi ?? null,
        }))
      : [],
  };
}

export function useJejaringList() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  // UX: hydrated = sudah pernah attempt baca cache (biar page bisa render tanpa "kedip")
  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(false);       // blocking (first load tanpa cache)
  const [refreshing, setRefreshing] = useState(false); // manual refresh / action
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const aliveRef = useRef(true);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
    [count]
  );

  const range = useMemo(() => {
    const p = Math.max(1, page);
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    return { from, to };
  }, [page]);

  async function fetchPage({ isRefresh = false, silent = false } = {}) {
    const myId = ++requestIdRef.current;
    setError("");

    // === UX RULES ===
    // - isRefresh true: user memang menunggu (tampilkan refreshing)
    // - silent true: background sync, jangan ganggu UX (no loading/refreshing)
    // - default: loading hanya kalau belum ada cache/hydrate (dipanggil internal)
    if (isRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    const timeoutMs = 12000;
    let timeoutHandle = null;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("Request timeout. Coba Refresh.")),
          timeoutMs
        );
      });

      const dataPromise = listJejaring(range);
      const result = await Promise.race([dataPromise, timeoutPromise]);

      if (!aliveRef.current || myId !== requestIdRef.current) return;

      const nextRows = Array.isArray(result?.rows) ? result.rows : [];
      const nextCount = Number(result?.count || 0);

      setRows(nextRows);
      setCount(nextCount);

      // simpan cache per range
      writeCache(makeRangeKey(range), nextRows, nextCount);
    } catch (e) {
      if (!aliveRef.current || myId !== requestIdRef.current) return;

      // UX: kalau silent fetch gagal, jangan hancurkan UI yang sudah tampil dari cache
      // Jadi: hanya set error, jangan set rows kosong kalau silent=true
      if (silent) {
        setError("");
      } else {
        setRows([]);
        setCount(0);
        setError(e?.message || "Terjadi error saat memuat data.");
      }
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (!aliveRef.current || myId !== requestIdRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // 1) Saat range berubah: tampilkan cache dulu (kalau ada), lalu fetch silent
  useEffect(() => {
    const key = makeRangeKey(range);

    const cached = readPageFromCache(key);
    if (cached) {
      // instant UI
      setRows(Array.isArray(cached.rows) ? cached.rows : []);
      setCount(Number(cached.count || 0));
      setHydrated(true);

      // background refresh tanpa mengganggu UX
      fetchPage({ silent: true });
      return;
    }

    // kalau tidak ada cache: first load -> boleh loading
    setHydrated(true);
    fetchPage({ silent: false });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  // 2) Jika page lebih besar dari pageCount (mis. setelah delete), adjust
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  return {
    rows,
    count,
    page,
    setPage,
    pageCount,
    loading,      // sekarang loading besar hanya ketika benar-benar perlu
    refreshing,   // dipakai untuk refresh manual / action
    error,
    hydrated,     // optional: kalau mau skeleton hanya saat !hydrated
    fetchPage,    // tetap support fetchPage({ isRefresh: true })
  };
}
