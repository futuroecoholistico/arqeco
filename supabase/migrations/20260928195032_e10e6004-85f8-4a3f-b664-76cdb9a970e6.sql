CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Project participants view projects" ON public.projects;
DROP POLICY "Project participants update projects" ON public.projects;
DROP POLICY "Participants view project history" ON public.project_status_history;
DROP POLICY "Participants add project history" ON public.project_status_history;
DROP POLICY "Active suppliers are public" ON public.suppliers;
DROP POLICY "Admins manage suppliers" ON public.suppliers;
DROP POLICY "Active materials are public" ON public.curated_materials;
DROP POLICY "Admins manage materials" ON public.curated_materials;

CREATE POLICY "Project participants view projects" ON public.projects FOR SELECT TO authenticated USING (client_id = auth.uid() OR professional_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Project participants update projects" ON public.projects FOR UPDATE TO authenticated USING (client_id = auth.uid() OR professional_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Participants view project history" ON public.project_status_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Participants add project history" ON public.project_status_history FOR INSERT TO authenticated WITH CHECK (changed_by = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Active suppliers are public" ON public.suppliers FOR SELECT TO anon, authenticated USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Active materials are public" ON public.curated_materials FOR SELECT TO anon, authenticated USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage materials" ON public.curated_materials FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION public.has_role(uuid, public.app_role);