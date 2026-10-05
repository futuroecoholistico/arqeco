
CREATE TABLE public.briefing_visual_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('style','palette','material','moodboard')),
  name text NOT NULL,
  description text,
  image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.briefing_visual_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.briefing_visual_options TO authenticated;
GRANT ALL ON public.briefing_visual_options TO service_role;
ALTER TABLE public.briefing_visual_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active visual options" ON public.briefing_visual_options FOR SELECT TO anon USING (is_active);
CREATE POLICY "Signed in view visual options" ON public.briefing_visual_options FOR SELECT TO authenticated USING (is_active OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage visual options" ON public.briefing_visual_options FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER briefing_visual_options_updated_at BEFORE UPDATE ON public.briefing_visual_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ADD COLUMN booking_id uuid UNIQUE REFERENCES public.service_bookings(id) ON DELETE SET NULL;

CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  schema_version int NOT NULL DEFAULT 1,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step int NOT NULL DEFAULT 0,
  progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','in_review','approved','revision_requested')),
  aesthetic_profile text,
  project_dna jsonb,
  ai_summary jsonb,
  eco_holistic jsonb,
  consents jsonb,
  admin_notes text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.briefings TO authenticated;
GRANT ALL ON public.briefings TO service_role;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Briefing participants view" ON public.briefings FOR SELECT TO authenticated USING (
  client_id = auth.uid() OR private.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.professional_id = auth.uid()));
CREATE POLICY "Clients create own briefing" ON public.briefings FOR INSERT TO authenticated WITH CHECK (
  client_id = auth.uid() AND status = 'draft' AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
CREATE POLICY "Clients edit open briefing" ON public.briefings FOR UPDATE TO authenticated
  USING (client_id = auth.uid() AND status IN ('draft','revision_requested'))
  WITH CHECK (client_id = auth.uid() AND status IN ('draft','revision_requested'));
CREATE POLICY "Admins manage briefings" ON public.briefings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER briefings_updated_at BEFORE UPDATE ON public.briefings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.briefing_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid NOT NULL REFERENCES public.briefings(id) ON DELETE CASCADE,
  room_key text NOT NULL,
  name text NOT NULL,
  needs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.briefing_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid NOT NULL REFERENCES public.briefings(id) ON DELETE CASCADE,
  name text, age text, relation text, occupation text, usage text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.briefing_rooms, public.briefing_people TO authenticated;
GRANT ALL ON public.briefing_rooms, public.briefing_people TO service_role;
ALTER TABLE public.briefing_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View briefing rooms" ON public.briefing_rooms FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.briefings b WHERE b.id = briefing_id));
CREATE POLICY "View briefing people" ON public.briefing_people FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.briefings b WHERE b.id = briefing_id));

CREATE TABLE public.briefing_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid NOT NULL REFERENCES public.briefings(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  category text NOT NULL DEFAULT 'outros',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.briefing_files TO authenticated;
GRANT ALL ON public.briefing_files TO service_role;
ALTER TABLE public.briefing_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View briefing files" ON public.briefing_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.briefings b WHERE b.id = briefing_id));
CREATE POLICY "Clients add files" ON public.briefing_files FOR INSERT TO authenticated WITH CHECK (
  client_id = auth.uid() AND storage_path LIKE auth.uid()::text || '/%'
  AND EXISTS (SELECT 1 FROM public.briefings b WHERE b.id = briefing_id AND b.client_id = auth.uid() AND b.status IN ('draft','revision_requested')));
CREATE POLICY "Clients remove files" ON public.briefing_files FOR DELETE TO authenticated USING (
  client_id = auth.uid() AND EXISTS (SELECT 1 FROM public.briefings b WHERE b.id = briefing_id AND b.status IN ('draft','revision_requested')));

CREATE OR REPLACE FUNCTION public.submit_briefing(_briefing_id uuid, _aesthetic_profile text, _project_dna jsonb, _consents jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b public.briefings; r jsonb; p jsonb;
BEGIN
  SELECT * INTO b FROM public.briefings WHERE id = _briefing_id AND client_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF b.status NOT IN ('draft','revision_requested') THEN RAISE EXCEPTION 'already submitted'; END IF;
  IF coalesce((_consents->>'accurate')::boolean,false) = false OR coalesce((_consents->>'files')::boolean,false) = false THEN
    RAISE EXCEPTION 'consents required'; END IF;
  DELETE FROM public.briefing_rooms WHERE briefing_id = b.id;
  DELETE FROM public.briefing_people WHERE briefing_id = b.id;
  FOR r IN SELECT * FROM jsonb_array_elements(coalesce(b.answers->'rooms','[]'::jsonb)) LOOP
    INSERT INTO public.briefing_rooms (briefing_id, room_key, name, needs)
    VALUES (b.id, coalesce(r->>'key','outro'), left(coalesce(r->>'name','Ambiente'),100), coalesce(b.answers->'roomNeeds'->(r->>'id'),'{}'::jsonb));
  END LOOP;
  FOR p IN SELECT * FROM jsonb_array_elements(coalesce(b.answers->'people','[]'::jsonb)) LOOP
    INSERT INTO public.briefing_people (briefing_id, name, age, relation, occupation, usage, notes)
    VALUES (b.id, left(p->>'name',100), left(p->>'age',10), left(p->>'relation',60), left(p->>'occupation',100), left(p->>'usage',300), left(p->>'notes',500));
  END LOOP;
  UPDATE public.briefings SET status = 'submitted', submitted_at = now(), progress = 100,
    aesthetic_profile = left(_aesthetic_profile,120), project_dna = _project_dna,
    consents = _consents || jsonb_build_object('recorded_at', now()) WHERE id = b.id;
  UPDATE public.projects SET status = 'BRIEFING_COMPLETED', next_action = 'Análise do briefing pela equipe' WHERE id = b.project_id;
  INSERT INTO public.project_status_history (project_id, status, note, changed_by) VALUES (b.project_id, 'BRIEFING_COMPLETED', 'Briefing enviado pelo cliente', auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.submit_briefing(uuid,text,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_briefing(uuid,text,jsonb,jsonb) TO authenticated;

-- backfill projects for already-confirmed bookings
INSERT INTO public.projects (client_id, professional_id, name, service_name, status, progress, next_action, booking_id)
SELECT b.client_id, b.professional_id, sp.name || ' · ' || o.rooms_label, sp.name, 'BRIEFING_PENDING', 5, 'Responder o briefing', b.id
FROM public.service_bookings b JOIN public.service_plans sp ON sp.id = b.plan_id JOIN public.service_plan_options o ON o.id = b.plan_option_id
WHERE b.status = 'confirmed' AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.booking_id = b.id);
INSERT INTO public.briefings (project_id, client_id)
SELECT p.id, p.client_id FROM public.projects p WHERE p.booking_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.briefings x WHERE x.project_id = p.id);
