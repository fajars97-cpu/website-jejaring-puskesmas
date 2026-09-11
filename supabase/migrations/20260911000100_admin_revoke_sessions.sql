-- Called only by the Edge Function after verifying the actor's bearer token.
create or replace function public.admin_revoke_sessions(p_actor_id uuid, p_target_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role text;
  removed integer;
begin
  if not exists (
    select 1 from public.profiles where user_id = p_actor_id and role = 'super_admin'
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  select role into target_role from public.profiles where user_id = p_target_id for update;
  if not found then
    raise exception 'Target not found' using errcode = 'P0002';
  end if;
  if target_role = 'super_admin' or p_actor_id = p_target_id then
    raise exception 'Cannot manage super_admin' using errcode = '42501';
  end if;

  -- Refresh tokens reference these sessions with ON DELETE CASCADE.
  delete from auth.sessions where user_id = p_target_id;
  get diagnostics removed = row_count;

  insert into public.admin_audit_logs(actor_id, target_id, action, meta)
  values (p_actor_id, p_target_id, 'FORCE_LOGOUT', jsonb_build_object('sessions_revoked', removed));
  return removed;
end;
$$;

revoke all on function public.admin_revoke_sessions(uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_sessions(uuid, uuid) to service_role;
