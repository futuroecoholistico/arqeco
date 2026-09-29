CREATE TYPE public.booking_status AS ENUM ('draft','awaiting_payment','payment_processing','confirmed','cancelled');
CREATE TYPE public.payment_status AS ENUM ('not_started','pending','paid','failed','refunded');

CREATE TABLE public.appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity smallint NOT NULL DEFAULT 1 CHECK (capacity BETWEEN 1 AND 20),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_slots_valid_range CHECK (ends_at > starts_at),
  UNIQUE (starts_at, ends_at)
);
GRANT SELECT ON public.appointment_slots TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.appointment_slots TO authenticated;
GRANT ALL ON public.appointment_slots TO service_role;
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users view available slots" ON public.appointment_slots FOR SELECT TO authenticated USING (is_available OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage appointment slots" ON public.appointment_slots FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER appointment_slots_updated_at BEFORE UPDATE ON public.appointment_slots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.service_plans(id) ON DELETE RESTRICT,
  plan_option_id uuid NOT NULL REFERENCES public.service_plan_options(id) ON DELETE RESTRICT,
  appointment_slot_id uuid REFERENCES public.appointment_slots(id) ON DELETE RESTRICT,
  full_name text,
  email text,
  phone text,
  property_type text,
  postal_code text,
  street text,
  street_number text,
  address_complement text,
  neighborhood text,
  city text,
  state text,
  add_extra_room boolean NOT NULL DEFAULT false,
  extra_room_price_cents int CHECK (extra_room_price_cents IS NULL OR extra_room_price_cents >= 0),
  urgent_delivery boolean NOT NULL DEFAULT false,
  urgent_fee_cents int NOT NULL DEFAULT 19000 CHECK (urgent_fee_cents = 19000),
  subtotal_cents int,
  total_cents int,
  status public.booking_status NOT NULL DEFAULT 'draft',
  payment_status public.payment_status NOT NULL DEFAULT 'not_started',
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_bookings_name_length CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 2 AND 100),
  CONSTRAINT service_bookings_email_length CHECK (email IS NULL OR char_length(email) <= 255),
  CONSTRAINT service_bookings_phone_length CHECK (phone IS NULL OR char_length(phone) BETWEEN 10 AND 20),
  CONSTRAINT service_bookings_address_lengths CHECK (
    (postal_code IS NULL OR char_length(postal_code) <= 9) AND
    (street IS NULL OR char_length(street) <= 160) AND
    (street_number IS NULL OR char_length(street_number) <= 20) AND
    (address_complement IS NULL OR char_length(address_complement) <= 100) AND
    (neighborhood IS NULL OR char_length(neighborhood) <= 100) AND
    (city IS NULL OR char_length(city) <= 100) AND
    (state IS NULL OR char_length(state) = 2)
  )
);
CREATE UNIQUE INDEX service_bookings_one_active_slot
ON public.service_bookings(appointment_slot_id)
WHERE appointment_slot_id IS NOT NULL AND status IN ('awaiting_payment','payment_processing','confirmed');
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_bookings TO authenticated;
GRANT ALL ON public.service_bookings TO service_role;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own bookings" ON public.service_bookings FOR SELECT TO authenticated USING (client_id = auth.uid() OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients create own draft bookings" ON public.service_bookings FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() AND status = 'draft' AND payment_status = 'not_started');
CREATE POLICY "Clients update own unpaid bookings" ON public.service_bookings FOR UPDATE TO authenticated USING (client_id = auth.uid() AND status IN ('draft','awaiting_payment') AND payment_status IN ('not_started','failed')) WITH CHECK (client_id = auth.uid() AND status IN ('draft','awaiting_payment') AND payment_status IN ('not_started','failed'));
CREATE POLICY "Clients delete own drafts" ON public.service_bookings FOR DELETE TO authenticated USING (client_id = auth.uid() AND status = 'draft');
CREATE POLICY "Admins manage bookings" ON public.service_bookings FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER service_bookings_updated_at BEFORE UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.reserve_service_booking(
  _booking_id uuid,
  _slot_id uuid,
  _full_name text,
  _email text,
  _phone text,
  _property_type text,
  _postal_code text,
  _street text,
  _street_number text,
  _address_complement text,
  _neighborhood text,
  _city text,
  _state text,
  _add_extra_room boolean,
  _urgent_delivery boolean
) RETURNS public.service_bookings
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result public.service_bookings;
  slot_available boolean;
  base_price int;
  extra_price int;
BEGIN
  IF char_length(trim(_full_name)) NOT BETWEEN 2 AND 100 THEN RAISE EXCEPTION 'invalid full name'; END IF;
  IF _email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' OR char_length(_email) > 255 THEN RAISE EXCEPTION 'invalid email'; END IF;
  IF _phone !~ '^[0-9()+ -]{10,20}$' THEN RAISE EXCEPTION 'invalid phone'; END IF;
  IF _postal_code !~ '^[0-9]{5}-?[0-9]{3}$' THEN RAISE EXCEPTION 'invalid postal code'; END IF;
  IF upper(_state) !~ '^[A-Z]{2}$' THEN RAISE EXCEPTION 'invalid state'; END IF;

  SELECT is_available AND starts_at > now() INTO slot_available
  FROM public.appointment_slots WHERE id = _slot_id FOR UPDATE;
  IF NOT coalesce(slot_available, false) THEN RAISE EXCEPTION 'slot unavailable'; END IF;
  IF EXISTS (SELECT 1 FROM public.service_bookings WHERE appointment_slot_id = _slot_id AND id <> _booking_id AND status IN ('awaiting_payment','payment_processing','confirmed')) THEN
    RAISE EXCEPTION 'slot already reserved';
  END IF;

  SELECT o.price_cents INTO base_price
  FROM public.service_bookings b JOIN public.service_plan_options o ON o.id = b.plan_option_id
  WHERE b.id = _booking_id AND b.client_id = auth.uid();
  IF base_price IS NULL THEN RAISE EXCEPTION 'price not configured'; END IF;

  IF _add_extra_room THEN
    SELECT o2.price_cents - base_price INTO extra_price
    FROM public.service_bookings b
    JOIN public.service_plan_options current_o ON current_o.id = b.plan_option_id
    JOIN LATERAL (
      SELECT candidate.price_cents FROM public.service_plan_options candidate
      WHERE candidate.plan_id = b.plan_id AND candidate.sort_order > current_o.sort_order AND candidate.price_cents IS NOT NULL
      ORDER BY candidate.sort_order LIMIT 1
    ) o2 ON true
    WHERE b.id = _booking_id;
    IF extra_price IS NULL OR extra_price < 0 THEN RAISE EXCEPTION 'extra room price not configured'; END IF;
  ELSE extra_price := 0;
  END IF;

  UPDATE public.service_bookings SET
    appointment_slot_id = _slot_id,
    full_name = trim(_full_name), email = lower(trim(_email)), phone = trim(_phone),
    property_type = trim(_property_type), postal_code = trim(_postal_code), street = trim(_street),
    street_number = trim(_street_number), address_complement = nullif(trim(_address_complement),''),
    neighborhood = trim(_neighborhood), city = trim(_city), state = upper(trim(_state)),
    add_extra_room = _add_extra_room, extra_room_price_cents = extra_price,
    urgent_delivery = _urgent_delivery, subtotal_cents = base_price,
    total_cents = base_price + extra_price + CASE WHEN _urgent_delivery THEN 19000 ELSE 0 END,
    status = 'awaiting_payment'
  WHERE id = _booking_id AND client_id = auth.uid() AND status = 'draft'
  RETURNING * INTO result;
  IF result.id IS NULL THEN RAISE EXCEPTION 'booking not found'; END IF;
  RETURN result;
END $$;
REVOKE EXECUTE ON FUNCTION public.reserve_service_booking(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.reserve_service_booking(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) TO authenticated;

INSERT INTO public.appointment_slots (starts_at, ends_at)
SELECT slot_start, slot_start + interval '1 hour'
FROM generate_series(
  date_trunc('day', now()) + interval '2 days 13 hours',
  date_trunc('day', now()) + interval '30 days 16 hours',
  interval '1 day'
) slot_start
WHERE extract(isodow FROM slot_start) BETWEEN 1 AND 5
  AND extract(hour FROM slot_start) IN (13, 15);