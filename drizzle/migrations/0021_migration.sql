CREATE TABLE public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX referral_clicks_affiliate_idx ON public.referral_clicks(affiliate_id, created_at);
GRANT SELECT ON public.referral_clicks TO authenticated;
GRANT ALL ON public.referral_clicks TO service_role;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate or admin reads clicks" ON public.referral_clicks FOR SELECT TO authenticated
USING (affiliate_id = auth.uid() OR public.is_admin());