import { useEffect, useMemo, useRef, useState } from "react";
import { PAGE_SIZE } from "./constants";
import { listJejaring } from "./api";

export function useJejaringList() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const aliveRef = useRef(true);

  const pageCount = useMemo(() => Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)), [count]);

  const range = useMemo(() => {
    const p = Math.max(1, page);
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    return { from, to };
  }, [page]);

  async function fetchPage({ isRefresh = false } = {}) {
    const myId = ++requestIdRef.current;
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const timeoutMs = 12000;
    let timeoutHandle = null;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error("Request timeout. Coba Refresh.")), timeoutMs);
      });

      const dataPromise = listJejaring(range);
      const result = await Promise.race([dataPromise, timeoutPromise]);

      if (!aliveRef.current || myId !== requestIdRef.current) return;

      setRows(result.rows);
      setCount(result.count);
    } catch (e) {
      if (!aliveRef.current || myId !== requestIdRef.current) return;
      setRows([]);
      setCount(0);
      setError(e?.message || "Terjadi error saat memuat data.");
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

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  return {
    rows,
    count,
    page,
    setPage,
    pageCount,
    loading,
    refreshing,
    error,
    fetchPage,
  };
}
