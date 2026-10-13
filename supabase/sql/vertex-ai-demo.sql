-- Guest trial state is accessible only by the demo Edge Function's server key.
create schema if not exists vertex_demo;
revoke all on schema vertex_demo from public, anon, authenticated;
grant usage on schema vertex_demo to service_role;

create table vertex_demo.trials (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create table vertex_demo.limits (
  scope text not null,
  bucket timestamptz not null,
  requests integer not null default 1,
  primary key (scope, bucket)
);
alter table vertex_demo.trials enable row level security;
alter table vertex_demo.limits enable row level security;
revoke all on all tables in schema vertex_demo from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema vertex_demo to service_role;

create function vertex_demo.consume_limit(p_scope text, p_bucket timestamptz, p_max integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  insert into vertex_demo.limits(scope, bucket) values (p_scope, p_bucket)
  on conflict (scope, bucket) do update
    set requests = vertex_demo.limits.requests + 1
    where vertex_demo.limits.requests < p_max
  returning requests into n;
  return n is not null;
end;
$$;
revoke all on function vertex_demo.consume_limit(text,timestamptz,integer) from public, anon, authenticated;
grant execute on function vertex_demo.consume_limit(text,timestamptz,integer) to service_role;

create function public.vertex_demo_access(p_action text, p_token_hash text, p_ip_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  expiry timestamptz;
  used integer;
  day_bucket timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
  minute_bucket timestamptz := date_trunc('minute', now());
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' or p_action not in ('start','status','chat') then
    return jsonb_build_object('ok',false,'code','invalid_request');
  end if;
  -- Bound counter storage while preserving expired trials to prevent token reuse.
  delete from vertex_demo.limits where bucket < day_bucket - interval '2 days';
  if p_action = 'start' then
    if not vertex_demo.consume_limit('start-ip:' || p_ip_hash, day_bucket, 3)
      or not vertex_demo.consume_limit('start-global', day_bucket, 1000) then
      return jsonb_build_object('ok',false,'code','start_limit');
    end if;
    insert into vertex_demo.trials(token_hash) values(p_token_hash);
  end if;
  select expires_at into expiry from vertex_demo.trials where token_hash = p_token_hash;
  if expiry is null then return jsonb_build_object('ok',false,'code','invalid_trial'); end if;
  if expiry <= now() then return jsonb_build_object('ok',false,'code','trial_expired','expires_at',expiry); end if;
  if p_action = 'chat' then
    if not vertex_demo.consume_limit('minute-ip:' || p_ip_hash, minute_bucket, 5) then
      return jsonb_build_object('ok',false,'code','rate_limit','expires_at',expiry);
    end if;
    if not vertex_demo.consume_limit('day-ip:' || p_ip_hash, day_bucket, 60)
      or not vertex_demo.consume_limit('day-trial:' || p_token_hash, day_bucket, 30) then
      return jsonb_build_object('ok',false,'code','daily_limit','expires_at',expiry);
    end if;
    if not vertex_demo.consume_limit('day-global', day_bucket, 1000) then
      return jsonb_build_object('ok',false,'code','service_limit','expires_at',expiry);
    end if;
  end if;
  select requests into used from vertex_demo.limits
    where scope = 'day-trial:' || p_token_hash and bucket = day_bucket;
  return jsonb_build_object('ok',true,'expires_at',expiry,'messages_remaining',greatest(0,30-coalesce(used,0)));
end;
$$;
revoke all on function public.vertex_demo_access(text,text,text) from public, anon, authenticated;
grant execute on function public.vertex_demo_access(text,text,text) to service_role;
