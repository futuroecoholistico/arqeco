ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS rooms jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS oversize_fee_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.service_plan_options ADD COLUMN IF NOT EXISTS room_area_limit_m2 integer NOT NULL DEFAULT 25;
ALTER TABLE public.service_plan_options ADD COLUMN IF NOT EXISTS oversize_step_m2 integer NOT NULL DEFAULT 10;
ALTER TABLE public.service_plan_options ADD COLUMN IF NOT EXISTS oversize_step_cents integer NOT NULL DEFAULT 15000;

CREATE OR REPLACE FUNCTION public.prepare_service_booking_rooms(_booking_id uuid, _full_name text, _email text, _phone text, _property_type text, _postal_code text, _street text, _street_number text, _address_complement text, _neighborhood text, _city text, _state text, _extra_room_count integer, _urgent_delivery boolean, _rooms jsonb)
RETURNS public.service_bookings LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE result public.service_bookings; o public.service_plan_options; per_room boolean; included int; expected int; r jsonb; area numeric; fee int := 0; clean jsonb := '[]'::jsonb;
BEGIN
  SELECT so.* INTO o FROM public.service_bookings b JOIN public.service_plan_options so ON so.id=b.plan_option_id WHERE b.id=_booking_id AND b.client_id=auth.uid();
  IF o.id IS NULL THEN RAISE EXCEPTION 'booking not found'; END IF;
  IF jsonb_typeof(_rooms) <> 'array' THEN RAISE EXCEPTION 'invalid rooms'; END IF;
  IF o.price_per_room THEN
    UPDATE public.service_bookings SET room_count = greatest(1, jsonb_array_length(_rooms)) WHERE id=_booking_id AND client_id=auth.uid();
    expected := jsonb_array_length(_rooms);
  ELSE
    included := coalesce(nullif(substring(o.rooms_label from '\d+'),'')::int, 1);
    expected := included + _extra_room_count;
  END IF;
  IF jsonb_array_length(_rooms) <> expected OR expected < 1 OR expected > 40 THEN RAISE EXCEPTION 'room list does not match plan'; END IF;
  FOR r IN SELECT * FROM jsonb_array_elements(_rooms) LOOP
    area := (r->>'area_m2')::numeric;
    IF area IS NULL OR area <= 0 OR area > 1000 THEN RAISE EXCEPTION 'invalid room area'; END IF;
    IF char_length(trim(coalesce(r->>'name',''))) NOT BETWEEN 2 AND 60 THEN RAISE EXCEPTION 'invalid room name'; END IF;
    IF area > o.room_area_limit_m2 THEN fee := fee + ceil((area - o.room_area_limit_m2) / o.oversize_step_m2)::int * o.oversize_step_cents; END IF;
    clean := clean || jsonb_build_array(jsonb_build_object('id', coalesce(r->>'id', gen_random_uuid()::text), 'key', left(coalesce(r->>'key','outro'),20), 'name', left(trim(r->>'name'),60), 'area_m2', area));
  END LOOP;
  result := public.prepare_service_booking(_booking_id,_full_name,_email,_phone,_property_type,_postal_code,_street,_street_number,_address_complement,_neighborhood,_city,_state,_extra_room_count,_urgent_delivery);
  UPDATE public.service_bookings SET rooms = clean, oversize_fee_cents = fee, total_cents = result.total_cents + fee WHERE id = result.id RETURNING * INTO result;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.prepare_service_booking_rooms(uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean,jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.prepare_service_booking(uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean) FROM authenticated;