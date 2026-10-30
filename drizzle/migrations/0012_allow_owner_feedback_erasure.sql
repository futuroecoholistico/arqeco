GRANT DELETE ON public.feedbacks TO authenticated;
CREATE POLICY "Owners erase feedback" ON public.feedbacks FOR DELETE TO authenticated USING(user_id=auth.uid());