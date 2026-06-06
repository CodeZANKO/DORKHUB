-- Allow users to view their own dorks regardless of status
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dorks') THEN
        DROP POLICY IF EXISTS "Users can view own dorks" ON public.dorks;
        CREATE POLICY "Users can view own dorks" ON public.dorks 
            FOR SELECT 
            USING (auth.uid() = author_id);
    END IF;
END
$$;
