ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS image_url text;
COMMENT ON COLUMN public.service_plans.image_url IS 'URL da imagem de capa exibida no cartão do plano na home.';