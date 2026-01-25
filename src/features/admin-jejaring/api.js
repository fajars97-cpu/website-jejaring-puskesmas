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
