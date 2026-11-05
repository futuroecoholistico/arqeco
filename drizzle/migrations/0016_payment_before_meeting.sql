CREATE OR REPLACE FUNCTION public.prepare_service_booking(_booking_id uuid, _full_name text, _email text, _phone text, _property_type text, _postal_code text, _street text, _street_number text, _address_complement text, _neighborhood text, _city text, _state text, _extra_room_count integer, _urgent_delivery boolean)
RETURNS service_bookings LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE result public.service_bookings; unit_price int; per_room boolean; rooms int; configured_extra_price int; configured_urgent_fee int; base_price int; extra_price int; urgent_price int;
BEGIN
 IF char_length(trim(_full_name)) NOT BETWEEN 2 AND 100 THEN RAISE EXCEPTION 'invalid full name'; END IF;
 IF _email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' OR char_length(_email) > 255 THEN RAISE EXCEPTION 'invalid email'; END IF;
 IF _phone !~ '^[0-9()+ -]{10,20}$' THEN RAISE EXCEPTION 'invalid phone'; END IF;
 IF _postal_code !~ '^[0-9]{5}-?[0-9]{3}$' THEN RAISE EXCEPTION 'invalid postal code'; END IF;
 IF upper(_state) !~ '^[A-Z]{2}$' THEN RAISE EXCEPTION 'invalid state'; END IF;
 IF _extra_room_count NOT BETWEEN 0 AND 30 THEN RAISE EXCEPTION 'invalid extra room count'; END IF;
 SELECT o.price_cents,o.price_per_room,b.room_count,o.extra_room_price_cents,o.urgent_fee_cents INTO unit_price,per_room,rooms,configured_extra_price,configured_urgent_fee FROM public.service_bookings b JOIN public.service_plan_options o ON o.id=b.plan_option_id AND o.plan_id=b.plan_id WHERE b.id=_booking_id AND b.client_id=auth.uid();
 IF unit_price IS NULL THEN RAISE EXCEPTION 'price not configured'; END IF;
 IF _urgent_delivery AND configured_urgent_fee IS NULL THEN RAISE EXCEPTION 'urgent fee not configured'; END IF;
 base_price := CASE WHEN per_room THEN unit_price*rooms ELSE unit_price END;
 extra_price := configured_extra_price*_extra_room_count;
 urgent_price := CASE WHEN _urgent_delivery THEN configured_urgent_fee ELSE 0 END;
 UPDATE public.service_bookings SET appointment_slot_id=NULL,full_name=trim(_full_name),email=lower(trim(_email)),phone=trim(_phone),property_type=trim(_property_type),postal_code=trim(_postal_code),street=trim(_street),street_number=trim(_street_number),address_complement=nullif(trim(_address_complement),''),neighborhood=trim(_neighborhood),city=trim(_city),state=upper(trim(_state)),add_extra_room=_extra_room_count>0,extra_room_count=_extra_room_count,extra_room_price_cents=extra_price,urgent_delivery=_urgent_delivery,urgent_fee_cents=coalesce(configured_urgent_fee,0),subtotal_cents=base_price,total_cents=base_price+extra_price+urgent_price,status='awaiting_payment' WHERE id=_booking_id AND client_id=auth.uid() AND status IN ('draft','awaiting_payment') AND payment_status IN ('not_started','failed') RETURNING * INTO result;
 IF result.id IS NULL THEN RAISE EXCEPTION 'booking not found'; END IF;
 RETURN result;
END $function$;
REVOKE ALL ON FUNCTION public.prepare_service_booking(uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.prepare_service_booking(uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_service_booking(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.schedule_paid_booking(_booking_id uuid,_slot_id uuid) RETURNS public.service_bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.service_bookings; s public.appointment_slots;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
 SELECT * INTO b FROM public.service_bookings WHERE id=_booking_id AND client_id=auth.uid() FOR UPDATE;
 IF b.id IS NULL THEN RAISE EXCEPTION 'booking not found'; END IF;
 IF b.payment_status <> 'paid' OR b.status <> 'confirmed' THEN RAISE EXCEPTION 'payment required before scheduling'; END IF;
 IF b.appointment_slot_id=_slot_id THEN RETURN b; END IF;
 IF b.appointment_slot_id IS NOT NULL THEN RAISE EXCEPTION 'meeting already scheduled'; END IF;
 SELECT * INTO s FROM public.appointment_slots WHERE id=_slot_id FOR UPDATE;
 IF s.id IS NULL OR NOT s.is_available OR s.starts_at<=now() THEN RAISE EXCEPTION 'slot unavailable'; END IF;
 IF b.professional_id IS NOT NULL AND b.professional_id IS DISTINCT FROM s.professional_id THEN RAISE EXCEPTION 'assigned professional mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM public.service_bookings WHERE appointment_slot_id=s.id AND status IN ('awaiting_payment','payment_processing','confirmed')) THEN RAISE EXCEPTION 'slot already reserved'; END IF;
 UPDATE public.service_bookings SET appointment_slot_id=s.id,professional_id=coalesce(s.professional_id,b.professional_id) WHERE id=b.id RETURNING * INTO b;
 UPDATE public.appointment_slots SET is_available=false WHERE id=s.id;
 UPDATE public.projects SET professional_id=b.professional_id WHERE booking_id=b.id;
 RETURN b;
END $$;
REVOKE ALL ON FUNCTION public.schedule_paid_booking(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.schedule_paid_booking(uuid,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_paid_meeting() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.appointment_slot_id IS NOT NULL AND (TG_OP='INSERT' OR NEW.appointment_slot_id IS DISTINCT FROM OLD.appointment_slot_id) AND (NEW.payment_status<>'paid' OR NEW.status<>'confirmed') THEN RAISE EXCEPTION 'payment required before scheduling'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_paid_meeting BEFORE INSERT OR UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION public.guard_paid_meeting();
COMMENT ON FUNCTION public.reserve_service_booking(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,integer,boolean) IS 'DEPRECATED: replaced by prepare_service_booking and schedule_paid_booking; meeting is scheduled only after payment.';