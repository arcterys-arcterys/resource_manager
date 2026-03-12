-- Run all of this in Supabase → SQL Editor → New Query
-- If you ran the old schema, run supabase_migrate.sql instead.

-- 1. Reservations queue
create table reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prefs text[] not null default '{}',
  position integer not null default 0,
  created_at timestamptz default now()
);

-- 2. Equipment pool
create table equipment (
  id uuid primary key default gen_random_uuid(),
  letters text not null default '',
  number text not null,
  desc text not null default '',
  created_at timestamptz default now()
);

-- 3. Confirmed matches
--    Unique constraints prevent duplicate confirmed matches even under race conditions
create table confirmed_matches (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  reservation_name text not null,
  equip_id uuid references equipment(id) on delete cascade,
  assigned_type text not null default '',
  assigned_number text not null,
  equip_desc text not null default '',
  created_at timestamptz default now(),
  -- FIX: unique constraints prevent race-condition duplicates
  unique (reservation_id),
  unique (equip_id)
);

-- 4. Denied pairs
--    FIX: reservation_id now correctly references reservations (not equipment)
create table denied_pairs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  equip_id uuid references equipment(id) on delete cascade,
  created_at timestamptz default now(),
  unique (reservation_id, equip_id)
);

-- 5. Allow public read/write (anyone with the link can use the app)
alter table reservations enable row level security;
alter table equipment enable row level security;
alter table confirmed_matches enable row level security;
alter table denied_pairs enable row level security;

create policy "public access" on reservations for all using (true) with check (true);
create policy "public access" on equipment for all using (true) with check (true);
create policy "public access" on confirmed_matches for all using (true) with check (true);
create policy "public access" on denied_pairs for all using (true) with check (true);

-- 6. FIX: Atomic queue swap function — swaps two rows' positions in a single transaction
--    Prevents corruption when two users reorder simultaneously
create or replace function swap_positions(id_a uuid, id_b uuid)
returns void language plpgsql as $$
declare
  pos_a integer;
  pos_b integer;
begin
  select position into pos_a from reservations where id = id_a for update;
  select position into pos_b from reservations where id = id_b for update;
  update reservations set position = pos_b where id = id_a;
  update reservations set position = pos_a where id = id_b;
end;
$$;

-- 7. FIX: Atomic confirm function — checks reservation/equipment not already confirmed
--    before inserting, all within one transaction. Prevents race-condition double-confirms.
create or replace function confirm_match(
  p_reservation_id uuid,
  p_reservation_name text,
  p_equip_id uuid,
  p_assigned_type text,
  p_assigned_number text,
  p_equip_desc text
) returns json language plpgsql as $$
begin
  -- Check neither side is already confirmed (handles race conditions)
  if exists (select 1 from confirmed_matches where reservation_id = p_reservation_id) then
    return json_build_object('error', 'Reservation already confirmed');
  end if;
  if exists (select 1 from confirmed_matches where equip_id = p_equip_id) then
    return json_build_object('error', 'Equipment already assigned');
  end if;

  insert into confirmed_matches
    (reservation_id, reservation_name, equip_id, assigned_type, assigned_number, equip_desc)
  values
    (p_reservation_id, p_reservation_name, p_equip_id, p_assigned_type, p_assigned_number, p_equip_desc);

  return json_build_object('ok', true);
end;
$$;

-- 8. Enable real-time so all sessions update live
alter publication supabase_realtime add table reservations;
alter publication supabase_realtime add table equipment;
alter publication supabase_realtime add table confirmed_matches;
alter publication supabase_realtime add table denied_pairs;
