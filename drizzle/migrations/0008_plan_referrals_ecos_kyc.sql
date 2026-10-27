ALTER TABLE public.partner_applications ADD COLUMN cpf text, ADD COLUMN phone text, ADD COLUMN document_path text, ADD COLUMN selfie_path text;

CREATE OR REPLACE FUNCTION public.is_approved_affiliate(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_applications WHERE user_id = _uid AND kind = 'affiliate' AND status = 'approved')
$$;

CREATE TABLE public.referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  plan_slug text NOT NULL CHECK (plan_slug IN ('start','viver-bem','viver-lifestyle')),
  code text NOT NULL UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (affiliate_id, plan_slug)
);
GRANT SELECT, INSERT, DELETE ON public.referral_links TO authenticated;
GRANT ALL ON public.referral_links TO service_role;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own links read" ON public.referral_links FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR public.is_admin());
CREATE POLICY "approved affiliates create" ON public.referral_links FOR INSERT TO authenticated WITH CHECK (affiliate_id = auth.uid() AND public.is_approved_affiliate(auth.uid()));
CREATE POLICY "own links delete" ON public.referral_links FOR DELETE TO authenticated USING (affiliate_id = auth.uid());

CREATE TABLE public.referral_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id uuid NOT NULL UNIQUE,
  link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_attributions TO authenticated;
GRANT ALL ON public.referral_attributions TO service_role;
ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate reads own referrals" ON public.referral_attributions FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR public.is_admin());

CREATE TABLE public.referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL UNIQUE REFERENCES public.service_bookings(id),
  plan_name text NOT NULL,
  sale_cents integer NOT NULL,
  commission_rate numeric NOT NULL,
  commission_cents integer NOT NULL,
  payout_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.referral_commissions TO authenticated;
GRANT ALL ON public.referral_commissions TO service_role;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate reads own commissions" ON public.referral_commissions FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR public.is_admin());
CREATE POLICY "admin updates commissions" ON public.referral_commissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.eco_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  ref text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eco_ledger TO authenticated;
GRANT ALL ON public.eco_ledger TO service_role;
ALTER TABLE public.eco_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ecos read" ON public.eco_ledger FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());