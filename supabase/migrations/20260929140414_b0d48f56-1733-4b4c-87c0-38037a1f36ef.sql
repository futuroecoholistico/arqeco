ALTER TYPE public.partner_kind ADD VALUE IF NOT EXISTS 'professional';

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  context text,
  project_label text,
  quote text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active testimonials are public" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_active OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.service_bookings
  ADD COLUMN room_count integer NOT NULL DEFAULT 1 CHECK (room_count BETWEEN 1 AND 30),
  ADD COLUMN professional_id uuid,
  ADD COLUMN checkout_session_id text,
  ADD COLUMN paid_at timestamptz;

CREATE POLICY "Professionals view assigned bookings" ON public.service_bookings FOR SELECT TO authenticated USING (professional_id = auth.uid());

CREATE OR REPLACE FUNCTION public.reserve_service_booking(_booking_id uuid, _slot_id uuid, _full_name text, _email text, _phone text, _property_type text, _postal_code text, _street text, _street_number text, _address_complement text, _neighborhood text, _city text, _state text, _add_extra_room boolean, _urgent_delivery boolean)
 RETURNS service_bookings
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  result public.service_bookings;
  slot_available boolean;
  unit_price int; per_room boolean; rooms int;
  base_price int; extra_price int;
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

  SELECT o.price_cents, o.price_per_room, b.room_count INTO unit_price, per_room, rooms
  FROM public.service_bookings b JOIN public.service_plan_options o ON o.id = b.plan_option_id
  WHERE b.id = _booking_id AND b.client_id = auth.uid();
  IF unit_price IS NULL THEN RAISE EXCEPTION 'price not configured'; END IF;
  base_price := CASE WHEN per_room THEN unit_price * rooms ELSE unit_price END;

  IF _add_extra_room THEN
    IF per_room THEN extra_price := unit_price;
    ELSE
      SELECT o2.price_cents - unit_price INTO extra_price
      FROM public.service_bookings b
      JOIN public.service_plan_options current_o ON current_o.id = b.plan_option_id
      JOIN LATERAL (
        SELECT candidate.price_cents FROM public.service_plan_options candidate
        WHERE candidate.plan_id = b.plan_id AND candidate.sort_order > current_o.sort_order AND candidate.price_cents IS NOT NULL
        ORDER BY candidate.sort_order LIMIT 1
      ) o2 ON true
      WHERE b.id = _booking_id;
    END IF;
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
    total_cents = base_price + extra_price + CASE WHEN _urgent_delivery THEN urgent_fee_cents ELSE 0 END,
    status = 'awaiting_payment'
  WHERE id = _booking_id AND client_id = auth.uid() AND status IN ('draft','awaiting_payment') AND payment_status IN ('not_started','failed')
  RETURNING * INTO result;
  IF result.id IS NULL THEN RAISE EXCEPTION 'booking not found'; END IF;
  RETURN result;
END $function$;

CREATE OR REPLACE FUNCTION public.review_partner_application(_id uuid, _approve boolean, _note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE app public.partner_applications; sid uuid;
BEGIN
  IF NOT private.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO app FROM public.partner_applications WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF _approve AND app.kind::text = 'supplier' AND app.supplier_id IS NULL THEN
    INSERT INTO public.suppliers (name, slug, category, city, website, owner_id)
    VALUES (app.display_name,
            regexp_replace(lower(app.display_name),'[^a-z0-9]+','-','g') || '-' || substr(app.id::text,1,6),
            coalesce(app.category,'Geral'), app.city, app.website, app.user_id)
    RETURNING id INTO sid;
    INSERT INTO public.supplier_secrets (supplier_id) VALUES (sid);
    UPDATE public.partner_applications SET supplier_id = sid WHERE id = _id;
  END IF;
  IF _approve AND app.kind::text = 'professional' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (app.user_id, 'professional') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  IF NOT _approve AND app.kind::text = 'professional' THEN
    DELETE FROM public.user_roles WHERE user_id = app.user_id AND role = 'professional';
  END IF;
  UPDATE public.partner_applications
     SET status = CASE WHEN _approve THEN 'approved'::review_status ELSE 'rejected'::review_status END,
         review_note = _note, reviewed_by = auth.uid(), reviewed_at = now()
   WHERE id = _id;
END $function$;

INSERT INTO public.testimonials (author_name, context, project_label, quote, sort_order) VALUES
('Exemplo ilustrativo', 'Cliente residencial', 'Sala integrada', 'Substitua este depoimento por um relato real no painel da equipe.', 1);