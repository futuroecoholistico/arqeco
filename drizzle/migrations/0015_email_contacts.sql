CREATE TABLE public.email_contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 full_name text,
 phone text,
 subscriber_status text NOT NULL DEFAULT 'subscribed',
 source text NOT NULL DEFAULT 'site_antigo',
 original_created_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_contacts TO authenticated;
GRANT ALL ON public.email_contacts TO service_role;
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email contacts" ON public.email_contacts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());