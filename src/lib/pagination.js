// Advance by the rows actually returned: the server may cap a requested page.
export async function collectPages(fetchPage, { pageSize = 500, limit = null } = {}) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("Invalid page size");
  if (limit != null && (!Number.isInteger(limit) || limit < 0)) throw new Error("Invalid limit");
  const rows = [];
  let target = limit || Infinity;
  while (rows.length < target) {
    const from = rows.length;
    const to = from + Math.min(pageSize, target - from) - 1;
    const { data, error, count } = await fetchPage(from, to);
    if (error) throw error;
    const batch = data || [];
    if (from === 0 && Number.isInteger(count)) target = Math.min(target, count);
    if (!batch.length) break;
    rows.push(...batch);
  }
  return rows.slice(0, Number.isFinite(target) ? target : rows.length);
}
