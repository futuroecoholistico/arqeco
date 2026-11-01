CREATE OR REPLACE FUNCTION public.guard_commission_payout()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' AND NOT EXISTS (
    SELECT 1 FROM public.payout_accounts WHERE user_id = NEW.affiliate_id AND document_path IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Afiliado sem dados bancários com documento anexado';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_commission_payout BEFORE UPDATE ON public.referral_commissions
  FOR EACH ROW EXECUTE FUNCTION public.guard_commission_payout();