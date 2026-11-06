ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS delivery_mode text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS delivery_business_days integer DEFAULT 15,
  ADD COLUMN IF NOT EXISTS briefing_meeting_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_delivery_due date,
  ADD COLUMN IF NOT EXISTS internal_notes text;

ALTER TABLE public.service_plan_options ADD COLUMN IF NOT EXISTS urgent_delivery_days integer;

CREATE TABLE public.holidays (day date PRIMARY KEY, name text NOT NULL);
GRANT SELECT ON public.holidays TO authenticated;
GRANT ALL ON public.holidays TO service_role;
GRANT INSERT, DELETE ON public.holidays TO authenticated;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read holidays" ON public.holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage holidays" ON public.holidays FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage text NOT NULL DEFAULT 'final',
  category text NOT NULL,
  title text NOT NULL,
  storage_path text,
  external_url text,
  version integer NOT NULL DEFAULT 1,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_files_stage_chk CHECK (stage IN ('presentation','revision','final')),
  CONSTRAINT project_files_category_chk CHECK (category IN ('layout','cortes','iluminacao','3d','materiais','links','apresentacao','outros')),
  CONSTRAINT project_files_target_chk CHECK (storage_path IS NOT NULL OR external_url IS NOT NULL)
);
GRANT SELECT, INSERT, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view project files" ON public.project_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));
CREATE POLICY "Team adds project files" ON public.project_files FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.professional_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));
CREATE POLICY "Team removes project files" ON public.project_files FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.professional_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

CREATE TABLE public.revision_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL DEFAULT auth.uid(),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revision_status_chk CHECK (status IN ('requested','in_progress','updated','closed')),
  CONSTRAINT revision_message_len CHECK (char_length(message) BETWEEN 3 AND 4000)
);
GRANT SELECT, INSERT, UPDATE ON public.revision_requests TO authenticated;
GRANT ALL ON public.revision_requests TO service_role;
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view revisions" ON public.revision_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));
CREATE POLICY "Clients request revisions" ON public.revision_requests FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() AND status = 'requested' AND response IS NULL AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid() AND p.status IN ('PRESENTATION','ADJUSTMENTS','APPROVAL')));
CREATE POLICY "Team answers revisions" ON public.revision_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.professional_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));
CREATE TRIGGER revision_requests_updated BEFORE UPDATE ON public.revision_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Clients may edit their project row (e.g. name) but never status, deadlines or meeting confirmation.
CREATE OR REPLACE FUNCTION public.guard_project_team_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR private.has_role(auth.uid(),'admin') OR auth.uid() = OLD.professional_id THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.delivery_mode IS DISTINCT FROM OLD.delivery_mode
     OR NEW.delivery_business_days IS DISTINCT FROM OLD.delivery_business_days
     OR NEW.briefing_meeting_done_at IS DISTINCT FROM OLD.briefing_meeting_done_at
     OR NEW.first_delivery_due IS DISTINCT FROM OLD.first_delivery_due
     OR NEW.internal_notes IS DISTINCT FROM OLD.internal_notes
     OR NEW.professional_id IS DISTINCT FROM OLD.professional_id THEN
    RAISE EXCEPTION 'Somente a equipe ARQECO pode alterar esses dados do projeto';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER projects_guard_team_fields BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.guard_project_team_fields();

CREATE OR REPLACE FUNCTION public.add_business_days(_start date, _days integer) RETURNS date LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE d date := _start; n integer := 0;
BEGIN
  IF _days IS NULL THEN RETURN NULL; END IF;
  WHILE n < _days LOOP
    d := d + 1;
    IF extract(isodow FROM d) < 6 AND NOT EXISTS (SELECT 1 FROM public.holidays h WHERE h.day = d) THEN n := n + 1; END IF;
  END LOOP;
  RETURN d;
END $$;

CREATE OR REPLACE FUNCTION public.set_project_status(_project_id uuid, _status project_status, _note text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.projects;
BEGIN
  SELECT * INTO p FROM public.projects WHERE id = _project_id;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Projeto não encontrado'; END IF;
  IF NOT (private.has_role(auth.uid(),'admin') OR p.professional_id = auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE public.projects SET status = _status, updated_at = now() WHERE id = _project_id;
  INSERT INTO public.project_status_history(project_id, status, note, changed_by) VALUES (_project_id, _status, _note, auth.uid());
END $$;

-- The deadline clock starts only when the team confirms the first briefing meeting actually happened.
CREATE OR REPLACE FUNCTION public.confirm_briefing_meeting(_project_id uuid, _done_on date DEFAULT NULL) RETURNS date LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.projects; d date := coalesce(_done_on, (now() AT TIME ZONE 'America/Sao_Paulo')::date); due date;
BEGIN
  SELECT * INTO p FROM public.projects WHERE id = _project_id;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Projeto não encontrado'; END IF;
  IF NOT (private.has_role(auth.uid(),'admin') OR p.professional_id = auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF d > (now() AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'A reunião não pode ser confirmada com data futura'; END IF;
  due := public.add_business_days(d, p.delivery_business_days);
  UPDATE public.projects SET briefing_meeting_done_at = d::timestamptz, first_delivery_due = due, status = 'DEVELOPMENT', next_action = NULL, updated_at = now() WHERE id = _project_id;
  INSERT INTO public.project_status_history(project_id, status, note, changed_by) VALUES (_project_id, 'DEVELOPMENT', 'Reunião de briefing realizada em ' || to_char(d,'DD/MM/YYYY'), auth.uid());
  RETURN due;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_project_status(uuid, project_status, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.confirm_briefing_meeting(uuid, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_project_status(uuid, project_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_briefing_meeting(uuid, date) TO authenticated;