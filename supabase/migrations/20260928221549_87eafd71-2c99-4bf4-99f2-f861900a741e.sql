CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.partner_kind AS ENUM ('supplier','affiliate');
CREATE TYPE public.review_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.conversion_status AS ENUM ('pending','approved','paid','cancelled');

-- Plans
CREATE TABLE public.service_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  badge text,
  cta_label text NOT NULL DEFAULT 'Escolher',
  deliverables text[] NOT NULL DEFAULT '{}',
  footnote text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_plans TO authenticated;
GRANT ALL ON public.service_plans TO service_role;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.service_plans FOR SELECT TO anon, authenticated USING (is_active OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage plans" ON public.service_plans FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER service_plans_updated_at BEFORE UPDATE ON public.service_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_plan_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.service_plans(id) ON DELETE CASCADE,
  rooms_label text NOT NULL,
  price_cents int,
  installments int NOT NULL DEFAULT 12,
  delivery_days int,
  meetings int,
  revisions int,
  includes_3d boolean NOT NULL DEFAULT true,
  includes_tour boolean NOT NULL DEFAULT false,
  includes_material_list boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_plan_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_plan_options TO authenticated;
GRANT ALL ON public.service_plan_options TO service_role;
ALTER TABLE public.service_plan_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan options are public" ON public.service_plan_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage plan options" ON public.service_plan_options FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER service_plan_options_updated_at BEFORE UPDATE ON public.service_plan_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Suppliers ownership + catalog commission
ALTER TABLE public.suppliers ADD COLUMN owner_id uuid, ADD COLUMN website text;
ALTER TABLE public.curated_materials ADD COLUMN commission_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100);

CREATE POLICY "Owners view own supplier" ON public.suppliers FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- Partner applications
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind public.partner_kind NOT NULL,
  display_name text NOT NULL,
  document text,
  website text,
  category text,
  city text,
  message text,
  status public.review_status NOT NULL DEFAULT 'pending',
  review_note text,
  supplier_id uuid REFERENCES public.suppliers(id),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
GRANT SELECT, INSERT, UPDATE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own applications" ON public.partner_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Users apply" ON public.partner_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending' AND supplier_id IS NULL AND reviewed_by IS NULL);
CREATE POLICY "Users edit pending application" ON public.partner_applications FOR UPDATE TO authenticated USING (user_id = auth.uid() AND status = 'pending') WITH CHECK (user_id = auth.uid() AND status = 'pending' AND supplier_id IS NULL AND reviewed_by IS NULL);
CREATE TRIGGER partner_applications_updated_at BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION private.is_approved_affiliate(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_applications WHERE user_id = _uid AND kind = 'affiliate' AND status = 'approved')
$$;
CREATE OR REPLACE FUNCTION private.owns_supplier(_uid uuid, _supplier uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers WHERE id = _supplier AND owner_id = _uid)
$$;
GRANT EXECUTE ON FUNCTION private.is_approved_affiliate(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_supplier(uuid, uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.is_approved_affiliate(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION private.owns_supplier(uuid, uuid) FROM anon, public;

-- Supplier integration secret
CREATE TABLE public.supplier_secrets (
  supplier_id uuid PRIMARY KEY REFERENCES public.suppliers(id) ON DELETE CASCADE,
  webhook_secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.supplier_secrets TO authenticated;
GRANT ALL ON public.supplier_secrets TO service_role;
ALTER TABLE public.supplier_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own secret" ON public.supplier_secrets FOR SELECT TO authenticated USING (private.owns_supplier(auth.uid(), supplier_id));

-- Product submissions
CREATE TABLE public.product_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 160),
  category text NOT NULL,
  description text,
  image_url text,
  product_url text NOT NULL,
  commission_rate numeric(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  sustainability_notes text,
  status public.review_status NOT NULL DEFAULT 'pending',
  eco_index smallint,
  review_note text,
  material_id uuid REFERENCES public.curated_materials(id),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.product_submissions TO authenticated;
GRANT ALL ON public.product_submissions TO service_role;
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers view own submissions" ON public.product_submissions FOR SELECT TO authenticated USING (private.owns_supplier(auth.uid(), supplier_id) OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Suppliers submit" ON public.product_submissions FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid() AND private.owns_supplier(auth.uid(), supplier_id) AND status = 'pending' AND material_id IS NULL AND reviewed_by IS NULL AND eco_index IS NULL);
CREATE POLICY "Suppliers edit pending" ON public.product_submissions FOR UPDATE TO authenticated USING (private.owns_supplier(auth.uid(), supplier_id) AND status = 'pending') WITH CHECK (private.owns_supplier(auth.uid(), supplier_id) AND status = 'pending' AND material_id IS NULL AND reviewed_by IS NULL AND eco_index IS NULL);
CREATE TRIGGER product_submissions_updated_at BEFORE UPDATE ON public.product_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Affiliate links
CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.curated_materials(id) ON DELETE CASCADE,
  project_label text NOT NULL DEFAULT 'Geral' CHECK (char_length(project_label) BETWEEN 1 AND 80),
  code text NOT NULL UNIQUE DEFAULT lower(encode(extensions.gen_random_bytes(5),'hex')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.affiliate_links TO authenticated;
GRANT ALL ON public.affiliate_links TO service_role;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own links" ON public.affiliate_links FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Approved affiliates create links" ON public.affiliate_links FOR INSERT TO authenticated WITH CHECK (affiliate_id = auth.uid() AND private.is_approved_affiliate(auth.uid()));
CREATE POLICY "Affiliates delete own links" ON public.affiliate_links FOR DELETE TO authenticated USING (affiliate_id = auth.uid());

CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX affiliate_clicks_link_idx ON public.affiliate_clicks(link_id);
GRANT SELECT ON public.affiliate_clicks TO authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own clicks" ON public.affiliate_clicks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.affiliate_links l WHERE l.id = link_id AND (l.affiliate_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

CREATE TABLE public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.affiliate_links(id),
  affiliate_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.curated_materials(id),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  order_ref text NOT NULL,
  sale_amount_cents int NOT NULL CHECK (sale_amount_cents >= 0),
  commission_rate numeric(5,2) NOT NULL,
  commission_cents int NOT NULL,
  status public.conversion_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, order_ref)
);
CREATE INDEX affiliate_conversions_affiliate_idx ON public.affiliate_conversions(affiliate_id);
GRANT SELECT, UPDATE ON public.affiliate_conversions TO authenticated;
GRANT ALL ON public.affiliate_conversions TO service_role;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties view conversions" ON public.affiliate_conversions FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR private.owns_supplier(auth.uid(), supplier_id) OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update conversions" ON public.affiliate_conversions FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER affiliate_conversions_updated_at BEFORE UPDATE ON public.affiliate_conversions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin review functions
CREATE OR REPLACE FUNCTION public.review_partner_application(_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE app public.partner_applications; sid uuid;
BEGIN
  IF NOT private.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO app FROM public.partner_applications WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF _approve AND app.kind = 'supplier' AND app.supplier_id IS NULL THEN
    INSERT INTO public.suppliers (name, slug, category, city, website, owner_id)
    VALUES (app.display_name,
            regexp_replace(lower(app.display_name),'[^a-z0-9]+','-','g') || '-' || substr(app.id::text,1,6),
            coalesce(app.category,'Geral'), app.city, app.website, app.user_id)
    RETURNING id INTO sid;
    INSERT INTO public.supplier_secrets (supplier_id) VALUES (sid);
    UPDATE public.partner_applications SET supplier_id = sid WHERE id = _id;
  END IF;
  UPDATE public.partner_applications
     SET status = CASE WHEN _approve THEN 'approved'::review_status ELSE 'rejected'::review_status END,
         review_note = _note, reviewed_by = auth.uid(), reviewed_at = now()
   WHERE id = _id;
END $$;

CREATE OR REPLACE FUNCTION public.review_product_submission(_id uuid, _approve boolean, _eco_index smallint DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.product_submissions; mid uuid;
BEGIN
  IF NOT private.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO s FROM public.product_submissions WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF _approve THEN
    IF _eco_index IS NULL OR _eco_index < 0 OR _eco_index > 100 THEN RAISE EXCEPTION 'eco index 0-100 required'; END IF;
    INSERT INTO public.curated_materials (supplier_id, name, category, description, image_url, affiliate_url, eco_index, commission_rate)
    VALUES (s.supplier_id, s.name, s.category, s.description, s.image_url, s.product_url, _eco_index, s.commission_rate)
    RETURNING id INTO mid;
  END IF;
  UPDATE public.product_submissions
     SET status = CASE WHEN _approve THEN 'approved'::review_status ELSE 'rejected'::review_status END,
         eco_index = _eco_index, material_id = mid, review_note = _note, reviewed_by = auth.uid(), reviewed_at = now()
   WHERE id = _id;
END $$;
REVOKE EXECUTE ON FUNCTION public.review_partner_application(uuid, boolean, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.review_product_submission(uuid, boolean, smallint, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.review_partner_application(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_product_submission(uuid, boolean, smallint, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT private.has_role(auth.uid(),'admin') $$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Seed plans (prices intentionally empty until provided)
INSERT INTO public.service_plans (slug, name, tagline, description, badge, cta_label, deliverables, footnote, sort_order) VALUES
('viver-bem','Viver Bem','Para transformar seu ambiente de forma prática, funcional e consciente.','Ideal para quem quer renovar um ou mais ambientes com orientação profissional, sem precisar passar por um processo complexo.',NULL,'Escolher Viver Bem',
 ARRAY['Briefing do ambiente','Análise das necessidades','Layout','Conceito de design','Definição de estilo','Paleta de cores','Seleção de mobiliário','Decoração','Iluminação','Materiais e acabamentos','Visualização 3D','Lista de materiais/compras','Curadoria ArqEco','Recomendações de escolhas conscientes','Ajustes conforme o plano'],NULL,1),
('viver-lifestyle','Viver Lifestyle','Para quem quer um espaço pensado para a sua rotina e sua forma de viver.','Aqui o projeto vai além da estética: o profissional considera seus hábitos, necessidades, conforto e experiência cotidiana.','Experiência mais completa','Quero Viver Lifestyle',
 ARRAY['Briefing aprofundado','Análise da rotina','Necessidades específicas','Layout funcional','Projeto de interiores','Conceito e identidade','Paleta de cores','Mobiliário','Iluminação','Materiais e acabamentos','Estratégias de conforto','Biophilia','Diretrizes de neuroarquitetura','Visualização 3D','Tour virtual, quando incluído no plano','Curadoria ArqEco','Lista de materiais','Produtos recomendados','Ajustes conforme o plano'],NULL,2),
('design-eco-holistico','Design Eco-Holístico','Para quem deseja compreender e transformar a relação entre pessoa e espaço.','Uma experiência baseada na metodologia proprietária Design Eco-Holístico, criada pela ArqEco.',NULL,'Conhecer Design Eco-Holístico',
 ARRAY['Anamnese aprofundada','Análise do ambiente','Análise da rotina','Necessidades e objetivos','Sustentabilidade','Conforto ambiental','Biophilia','Neuroarquitetura','Sensorialidade','Leitura dos cinco elementos','Dimensão vibracional segundo a metodologia','Diretrizes espaciais','Diretrizes sensoriais','Relatório Eco-Holístico','Curadoria ArqEco','Recomendações de materiais','Visualização 3D, quando contratada','Lista de materiais, quando aplicável'],'A experiência sensorial e vibracional é exclusiva do Design Eco-Holístico.',3);

INSERT INTO public.service_plan_options (plan_id, rooms_label, includes_tour, sort_order)
SELECT p.id, r.label, (p.slug <> 'viver-bem' AND r.ord >= 3), r.ord
FROM public.service_plans p
CROSS JOIN (VALUES ('1 ambiente',1),('2 ambientes',2),('4 ambientes',3),('6 ambientes',4),('Projeto completo',5)) AS r(label, ord);
