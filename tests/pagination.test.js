import test from "node:test";
import assert from "node:assert/strict";
import { collectPages } from "../src/lib/pagination.js";

test("collects more than 500 rows without skipping a smaller server page", async () => {
  const source = Array.from({ length: 1251 }, (_, id) => ({ id }));
  const actual = await collectPages(async (from, to) => ({
    data: source.slice(from, Math.min(to + 1, from + 200)), count: source.length,
  }));
  assert.deepEqual(actual, source);
});

test("stops export on an empty response even when the original count is higher", async () => {
  let calls = 0;
  const rows = await collectPages(async () => {
    assert.ok(++calls <= 2, "export must not request indefinitely");
    return { data: calls === 1 ? [{ id: 1 }] : [], count: 1000 };
  });
  assert.deepEqual(rows, [{ id: 1 }]);
  assert.equal(calls, 2);
});

test("handles missing counts, empty datasets, and explicit limits", async () => {
  const source = [1, 2, 3, 4, 5];
  const page = async (from, to) => ({ data: source.slice(from, to + 1) });
  assert.deepEqual(await collectPages(page, { pageSize: 2 }), source);
  assert.deepEqual(await collectPages(page, { pageSize: 2, limit: 3 }), [1, 2, 3]);
  assert.deepEqual(await collectPages(async () => ({ data: [], count: 0 })), []);
});

test("propagates errors instead of exporting partial data", async () => {
  const failure = new Error("connection lost");
  await assert.rejects(collectPages(async (from) => from === 0
    ? { data: [1], count: 2 } : { error: failure }), failure);
});

test("rejects invalid page sizes and limits before requesting", async () => {
  const unexpected = () => assert.fail("must validate before requesting");
  await assert.rejects(collectPages(unexpected, { pageSize: 0 }));
  await assert.rejects(collectPages(unexpected, { limit: -1 }));
});
