-- Run this ONLY if you already ran the original supabase_schema.sql
-- This patches the three critical bugs without dropping your existing data

-- FIX 1: Correct the denied_pairs foreign key (was pointing to equipment, should be reservations)
alter table denied_pairs
  drop constraint if exists denied_pairs_reservation_id_fkey;

alter table denied_pairs
  add constraint denied_pairs_reservation_id_fkey
  foreign key (reservation_id) references reservations(id) on delete cascade;

-- FIX 2: Add unique constraints to confirmed_matches to prevent duplicate confirmations
alter table confirmed_matches
  drop constraint if exists confirmed_matches_reservation_id_key,
  drop constraint if exists confirmed_matches_equip_id_key;

alter table confirmed_matches
  add constraint confirmed_matches_reservation_id_key unique (reservation_id),
  add constraint confirmed_matches_equip_id_key unique (equip_id);

-- FIX 3: Add unique constraint to denied_pairs to prevent duplicate denials
alter table denied_pairs
  drop constraint if exists denied_pairs_reservation_id_equip_id_key;

alter table denied_pairs
  add constraint denied_pairs_reservation_id_equip_id_key unique (reservation_id, equip_id);

-- FIX 4: Atomic swap function for queue reordering
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

-- FIX 5: Atomic confirm function to prevent race-condition double-confirms
create or replace function confirm_match(
  p_reservation_id uuid,
  p_reservation_name text,
  p_equip_id uuid,
  p_assigned_type text,
  p_assigned_number text,
  p_equip_description text
) returns json language plpgsql as $$
begin
  if exists (select 1 from confirmed_matches where reservation_id = p_reservation_id) then
    return json_build_object('error', 'Reservation already confirmed');
  end if;
  if exists (select 1 from confirmed_matches where equip_id = p_equip_id) then
    return json_build_object('error', 'Equipment already assigned');
  end if;

  insert into confirmed_matches
    (reservation_id, reservation_name, equip_id, assigned_type, assigned_number, equip_description)
  values
    (p_reservation_id, p_reservation_name, p_equip_id, p_assigned_type, p_assigned_number, p_equip_description);

  return json_build_object('ok', true);
end;
$$;
