CREATE TYPE public.construction_scope AS ENUM ('project_only', 'project_build_followup');
CREATE TYPE public.construction_inquiry_status AS ENUM ('submitted', 'meeting_scheduled', 'contacted', 'converted', 'closed');

CREATE TABLE public.construction_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 10 AND 20),
  postal_code text NOT NULL CHECK (postal_code ~ '^\d{5}-?\d{3}$'),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 100),
  state text NOT NULL CHECK (state ~ '^[A-Z]{2}$'),
  construction_description text NOT NULL CHECK (char_length(construction_description) BETWEEN 10 AND 1500),
  service_scope public.construction_scope NOT NULL,
  desired_timeline text NOT NULL CHECK (char_length(desired_timeline) BETWEEN 2 AND 100),
  appointment_slot_id uuid UNIQUE REFERENCES public.appointment_slots(id) ON DELETE SET NULL,
  status public.construction_inquiry_status NOT NULL DEFAULT 'submitted',
  admin_notes text CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.construction_inquiries TO authenticated;
GRANT UPDATE (appointment_slot_id, status) ON public.construction_inquiries TO authenticated;
GRANT ALL ON public.construction_inquiries TO service_role;

ALTER TABLE public.construction_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients create construction inquiries"
ON public.construction_inquiries FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid() AND status = 'submitted' AND appointment_slot_id IS NULL);

CREATE POLICY "Clients view own construction inquiries"
ON public.construction_inquiries FOR SELECT TO authenticated
USING (client_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage construction inquiries"
ON public.construction_inquiries FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.schedule_construction_meeting(_inquiry_id uuid, _slot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _available boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.construction_inquiries
    WHERE id = _inquiry_id AND client_id = auth.uid() AND appointment_slot_id IS NULL
  ) THEN
    RAISE EXCEPTION 'inquiry_not_available';
  END IF;

  SELECT is_available INTO _available
  FROM public.appointment_slots
  WHERE id = _slot_id AND starts_at > now()
  FOR UPDATE;

  IF COALESCE(_available, false) = false THEN
    RAISE EXCEPTION 'slot_not_available';
  END IF;

  UPDATE public.appointment_slots SET is_available = false WHERE id = _slot_id;
  UPDATE public.construction_inquiries
  SET appointment_slot_id = _slot_id, status = 'meeting_scheduled', updated_at = now()
  WHERE id = _inquiry_id AND client_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.schedule_construction_meeting(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.schedule_construction_meeting(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_construction_inquiries_updated_at
BEFORE UPDATE ON public.construction_inquiries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX construction_inquiries_client_idx ON public.construction_inquiries(client_id, created_at DESC);
CREATE INDEX construction_inquiries_status_idx ON public.construction_inquiries(status, created_at DESC);