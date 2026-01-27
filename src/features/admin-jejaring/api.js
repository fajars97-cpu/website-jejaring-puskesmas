// src/features/admin-jejaring/api.js
import { supabase } from "../../lib/supabaseClient";
import { TABLE } from "./constants";

export async function listJejaring({ from, to }) {
  const base = supabase.from(TABLE).select("*", { count: "exact" }).range(from, to);

  let { data, error, count } = await base.order("created_at", { ascending: false });
  if (error) {
    const fallback = supabase
      .from(TABLE)
      .select("*", { count: "exact" })
      .range(from, to)
      .order("id", { ascending: false });

    const r2 = await fallback;
    data = r2.data;
    error = r2.error;
    count = r2.count;
  }

  if (error) throw error;
  return { rows: data || [], count: count || 0 };
}

export async function createJejaring(payload) {
  const { error } = await supabase.from(TABLE).insert(payload);
  if (error) throw error;
}

export async function updateJejaring(pk, value, payload) {
  const { error } = await supabase.from(TABLE).update(payload).eq(pk, value);
  if (error) throw error;
}

export async function deleteJejaring(pk, value) {
  const { error } = await supabase.from(TABLE).delete().eq(pk, value);
  if (error) throw error;
}

// Fetch ALL rows (for export). Chunking supaya aman kalau data banyak.
export async function fetchAllJejaring({ columns = "*", chunkSize = 1000 } = {}) {
  const table = "jejaring_fasyankes";
  let all = [];
  let from = 0;

  // coba ambil count biar loop rapi (kalau count null tetap aman)
  const first = await supabase
    .from(table)
    .select(columns, { count: "exact" })
    .range(0, chunkSize - 1);

  if (first.error) throw first.error;
  all = all.concat(first.data || []);

  const total = first.count ?? null;
  // kalau count ada, loop sampai total
  if (typeof total === "number") {
    from = chunkSize;
    while (all.length < total) {
      const to = from + chunkSize - 1;
      const res = await supabase.from(table).select(columns).range(from, to);
      if (res.error) throw res.error;
      all = all.concat(res.data || []);
      from += chunkSize;
    }
    return all;
  }

  // fallback: loop sampai batch < chunkSize
  from = chunkSize;
  while (true) {
    const to = from + chunkSize - 1;
    const res = await supabase.from(table).select(columns).range(from, to);
    if (res.error) throw res.error;
    const batch = res.data || [];
    if (!batch.length) break;
    all = all.concat(batch);
    if (batch.length < chunkSize) break;
    from += chunkSize;
  }

  return all;
}