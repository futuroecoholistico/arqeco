CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'professional', 'creator', 'partner');
CREATE TYPE public.project_status AS ENUM ('PAYMENT_CONFIRMED', 'BRIEFING_PENDING', 'BRIEFING_COMPLETED', 'BRIEFING_VALIDATED', 'MEETING_1', 'DEVELOPMENT', 'PRESENTATION', 'ADJUSTMENTS', 'APPROVAL', 'FINAL_DELIVERY', 'CERTIFICATION_REVIEW', 'CERTIFIED', 'COMPLETED');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  account_type public.app_role NOT NULL DEFAULT 'client',
  avatar_url text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND account_type <> 'admin');
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND account_type <> 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  professional_id uuid,
  name text NOT NULL,
  service_name text NOT NULL,
  status public.project_status NOT NULL DEFAULT 'BRIEFING_PENDING',
  progress smallint NOT NULL DEFAULT 10 CHECK (progress BETWEEN 0 AND 100),
  next_action text,
  due_date date,
  eco_index smallint CHECK (eco_index BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project participants view projects" ON public.projects FOR SELECT TO authenticated USING (client_id = auth.uid() OR professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Project participants update projects" ON public.projects FOR UPDATE TO authenticated USING (client_id = auth.uid() OR professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.project_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status public.project_status NOT NULL,
  note text,
  changed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.project_status_history TO authenticated;
GRANT ALL ON public.project_status_history TO service_role;
ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view project history" ON public.project_status_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Participants add project history" ON public.project_status_history FOR INSERT TO authenticated WITH CHECK (changed_by = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  city text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.suppliers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active suppliers are public" ON public.suppliers FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.curated_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  image_url text,
  affiliate_url text NOT NULL,
  eco_index smallint NOT NULL CHECK (eco_index BETWEEN 0 AND 100),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curated_materials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.curated_materials TO authenticated;
GRANT ALL ON public.curated_materials TO service_role;
ALTER TABLE public.curated_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active materials are public" ON public.curated_materials FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage materials" ON public.curated_materials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER curated_materials_updated_at BEFORE UPDATE ON public.curated_materials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.suppliers (name, slug, category, city) VALUES
('Madeira Viva', 'madeira-viva', 'Madeiras certificadas', 'São Paulo'),
('Lumini', 'lumini', 'Iluminação consciente', 'São Paulo'),
('Terracor', 'terracor', 'Tintas minerais', 'Rio de Janeiro');

INSERT INTO public.curated_materials (supplier_id, name, category, description, affiliate_url, eco_index, attributes)
SELECT id, 'Piso Cumaru Certificado', 'Pisos', 'Madeira rastreada com acabamento de baixo impacto.', 'https://example.com/madeira-viva', 92, '{"origem":"FSC", "voc":"baixo"}'::jsonb FROM public.suppliers WHERE slug = 'madeira-viva'
UNION ALL
SELECT id, 'Pendente Atemporal 2700K', 'Iluminação', 'Luz acolhedora e eficiente para áreas sociais.', 'https://example.com/lumini', 86, '{"eficiencia":"A", "temperatura":"2700K"}'::jsonb FROM public.suppliers WHERE slug = 'lumini'
UNION ALL
SELECT id, 'Tinta Mineral Névoa', 'Revestimentos', 'Tinta respirável de base mineral e baixa emissão.', 'https://example.com/terracor', 89, '{"base":"mineral", "voc":"muito baixo"}'::jsonb FROM public.suppliers WHERE slug = 'terracor';