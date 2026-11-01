CREATE TABLE public.payout_accounts (
  user_id uuid PRIMARY KEY,
  holder_name text NOT NULL,
  holder_cpf text NOT NULL,
  pix_key text,
  bank text,
  agency text,
  account text,
  document_path text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payout_accounts TO authenticated;
GRANT ALL ON public.payout_accounts TO service_role;
ALTER TABLE public.payout_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage payout account" ON public.payout_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND document_path LIKE auth.uid()::text || '/%');
CREATE POLICY "Admins read payout accounts" ON public.payout_accounts FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'));