-- Optimize RLS policies to use is_admin() function for better performance and reliability
-- This script is designed to be resilient and will only attempt to modify policies if the respective tables exist.

DO $$
BEGIN
    -- Update Dorks Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dorks') THEN
        DROP POLICY IF EXISTS "Approved dorks are viewable by everyone" ON public.dorks;
        CREATE POLICY "Approved dorks are viewable by everyone" ON public.dorks 
            FOR SELECT 
            USING (status = 'approved' OR (SELECT public.is_admin()));

        DROP POLICY IF EXISTS "Admins can manage all dorks" ON public.dorks;
        CREATE POLICY "Admins can manage all dorks" ON public.dorks
            FOR ALL
            USING (public.is_admin());
    END IF;

    -- Update Profiles Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" ON public.profiles 
            FOR UPDATE 
            USING (auth.uid() = id OR public.is_admin());
    END IF;

    -- Update Categories Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
        CREATE POLICY "Admins can manage categories" ON public.categories
            FOR ALL
            USING (public.is_admin());
    END IF;

    -- Update Platforms Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'platforms') THEN
        DROP POLICY IF EXISTS "Admins can manage platforms" ON public.platforms;
        CREATE POLICY "Admins can manage platforms" ON public.platforms 
            FOR ALL 
            USING (public.is_admin());
    END IF;

    -- Update Votes Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'votes') THEN
        DROP POLICY IF EXISTS "Admins can view all votes" ON public.votes;
        CREATE POLICY "Admins can view all votes" ON public.votes 
            FOR SELECT 
            USING (public.is_admin());
    END IF;

    -- Update Favorites Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
        DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;
        CREATE POLICY "Admins can view all favorites" ON public.favorites 
            FOR SELECT 
            USING (public.is_admin());
    END IF;
END
$$;
