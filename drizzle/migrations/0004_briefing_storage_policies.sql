
CREATE POLICY "Clients upload own briefing files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'briefing-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Clients read own briefing files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'briefing-files' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.briefing_files f JOIN public.briefings b ON b.id = f.briefing_id JOIN public.projects p ON p.id = b.project_id
               WHERE f.storage_path = name AND p.professional_id = auth.uid())));
CREATE POLICY "Clients delete own briefing files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'briefing-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins upload library images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'briefing-files' AND (storage.foldername(name))[1] = 'library' AND private.has_role(auth.uid(),'admin'));
