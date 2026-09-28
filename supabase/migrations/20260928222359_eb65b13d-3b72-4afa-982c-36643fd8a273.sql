DROP POLICY "Plans are public" ON public.service_plans;
CREATE POLICY "Active plans are public" ON public.service_plans FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY "Active materials are public" ON public.curated_materials;
CREATE POLICY "Active materials are public" ON public.curated_materials FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY "Active suppliers are public" ON public.suppliers;
CREATE POLICY "Active suppliers are public" ON public.suppliers FOR SELECT TO anon, authenticated USING (is_active);