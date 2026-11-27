-- Pedidos de orçamento públicos (sem login), vindos de /orcamento e das páginas Casa e Negócio.
-- Qualquer visitante pode criar; só a equipe (admin) lê e atualiza.
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  project_type text NOT NULL,
  city text NOT NULL,
  message text,
  source_page text,
  status text NOT NULL DEFAULT 'novo',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quote_requests_name_chk CHECK (char_length(full_name) BETWEEN 2 AND 100),
  CONSTRAINT quote_requests_whatsapp_chk CHECK (whatsapp ~ '^[0-9()+ -]{10,20}$'),
  CONSTRAINT quote_requests_type_chk CHECK (project_type IN ('casa_decorar','casa_construir','comercial','profissional','outro')),
  CONSTRAINT quote_requests_city_chk CHECK (char_length(city) BETWEEN 2 AND 100),
  CONSTRAINT quote_requests_message_chk CHECK (message IS NULL OR char_length(message) <= 1500),
  CONSTRAINT quote_requests_source_chk CHECK (source_page IS NULL OR char_length(source_page) <= 100),
  CONSTRAINT quote_requests_status_chk CHECK (status IN ('novo','em_contato','fechado','nao_fechado')),
  CONSTRAINT quote_requests_notes_chk CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 2000)
);
CREATE INDEX quote_requests_created_idx ON public.quote_requests(created_at DESC);

GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Visitantes só criam pedidos novos, sem status nem anotações da equipe.
CREATE POLICY "anyone creates new quote request" ON public.quote_requests FOR INSERT TO anon, authenticated
WITH CHECK (status = 'novo' AND admin_notes IS NULL);
CREATE POLICY "admins read quote requests" ON public.quote_requests FOR SELECT TO authenticated
USING (public.is_admin());
CREATE POLICY "admins update quote requests" ON public.quote_requests FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_quote_request() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER quote_requests_touch BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.touch_quote_request();
