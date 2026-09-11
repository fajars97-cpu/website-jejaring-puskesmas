import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("session revocation enforces roles, cascades refresh tokens, and audits atomically", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth;
      create table public.profiles(user_id uuid primary key, role text);
      create table auth.sessions(id uuid primary key, user_id uuid);
      create table auth.refresh_tokens(id integer primary key, session_id uuid references auth.sessions(id) on delete cascade);
      create table public.admin_audit_logs(actor_id uuid, target_id uuid, action text, meta jsonb);
      insert into public.profiles values
        ('11111111-1111-4111-8111-111111111111', 'super_admin'),
        ('22222222-2222-4222-8222-222222222222', 'pemohon');
      insert into auth.sessions values ('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222');
      insert into auth.refresh_tokens values (1,'33333333-3333-4333-8333-333333333333');
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/20260911000100_admin_revoke_sessions.sql', import.meta.url), 'utf8'));
    const actor = '11111111-1111-4111-8111-111111111111';
    const target = '22222222-2222-4222-8222-222222222222';
    const revoke = (a, t) => db.query('select public.admin_revoke_sessions($1, $2) as removed', [a, t]);
    await db.exec('set role authenticated');
    await assert.rejects(revoke(actor, target), /permission denied/);
    await db.exec('reset role; set role service_role');
    await assert.rejects(revoke(target, actor), /Forbidden/);
    await assert.rejects(revoke(actor, actor), /Cannot manage super_admin/);
    await assert.rejects(revoke(actor, '44444444-4444-4444-8444-444444444444'), /Target not found/);
    await db.exec('reset role');
    // Failure to write the audit must roll back the session deletion too.
    await db.exec("alter table public.admin_audit_logs add constraint reject_audit check (action <> 'FORCE_LOGOUT')");
    await assert.rejects(revoke(actor, target), /reject_audit/);
    assert.equal((await db.query('select count(*)::int as n from auth.sessions')).rows[0].n, 1);
    await db.exec('alter table public.admin_audit_logs drop constraint reject_audit; set role service_role');
    assert.equal((await revoke(actor, target)).rows[0].removed, 1);
    await db.exec('reset role');
    assert.equal((await db.query('select count(*)::int as n from auth.refresh_tokens')).rows[0].n, 0);
    assert.equal((await db.query('select count(*)::int as n from public.admin_audit_logs')).rows[0].n, 1);
  } finally {
    await db.close();
  }
});
