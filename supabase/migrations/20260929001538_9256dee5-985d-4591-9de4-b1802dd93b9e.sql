ALTER TABLE public.service_plan_options
  ADD COLUMN IF NOT EXISTS compare_at_price_cents integer,
  ADD COLUMN IF NOT EXISTS price_per_room boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_starting_price boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS description text;

UPDATE public.service_plan_options o SET price_cents = 59800, compare_at_price_cents = 92000
FROM public.service_plans p WHERE p.id = o.plan_id AND p.slug = 'viver-bem' AND o.rooms_label = '2 ambientes';
UPDATE public.service_plan_options o SET price_cents = 83600, compare_at_price_cents = 128600
FROM public.service_plans p WHERE p.id = o.plan_id AND p.slug = 'viver-lifestyle' AND o.rooms_label = '4 ambientes';

DELETE FROM public.service_plan_options o USING public.service_plans p
WHERE p.id = o.plan_id AND p.slug = 'design-eco-holistico';

INSERT INTO public.service_plan_options (plan_id, rooms_label, description, price_cents, price_per_room, is_starting_price, includes_3d, includes_material_list, sort_order)
SELECT id, 'Faça você mesmo', 'Harmonização pelo app, no seu ritmo.', 6900, true, false, false, false, 1 FROM public.service_plans WHERE slug = 'design-eco-holistico'
UNION ALL
SELECT id, 'Com projeto de interiores', 'Projeto de interiores personalizado + harmonização Eco-Holística.', 35000, true, true, true, true, 2 FROM public.service_plans WHERE slug = 'design-eco-holistico';

UPDATE public.service_plans SET
  tagline = 'Consultoria para harmonizar ambientes e trazer mais bem-estar.',
  description = 'Uma consultoria baseada na metodologia proprietária Design Eco-Holístico. Não inclui projeto 3D personalizado, que pode ser contratado à parte.',
  deliverables = ARRAY['Anamnese aprofundada','Análise do ambiente e da rotina','Biophilia e neuroarquitetura','Sensorialidade','Leitura dos cinco elementos','Dimensão vibracional segundo a metodologia','Diretrizes espaciais e sensoriais','Relatório Eco-Holístico','Projeto 3D personalizado contratado à parte'],
  footnote = 'Consultoria de harmonização. Projeto 3D personalizado contratado à parte.'
WHERE slug = 'design-eco-holistico';