-- CONSOLIDATED INITIALIZATION SCRIPT
-- Run this in the Supabase SQL Editor to ensure all tables, functions, and policies are correctly set up.

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    reputation INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Terminal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    icon TEXT DEFAULT 'Globe',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dorks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    description TEXT,
    platform TEXT DEFAULT 'google',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    success_rate FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    dork_id UUID REFERENCES public.dorks(id) ON DELETE CASCADE,
    value INTEGER CHECK (value IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, dork_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    dork_id UUID REFERENCES public.dorks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, dork_id)
);

-- 3. Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dorks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DO $$
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

    -- Categories
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
    CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

    -- Platforms
    DROP POLICY IF EXISTS "Platforms are viewable by everyone" ON public.platforms;
    CREATE POLICY "Platforms are viewable by everyone" ON public.platforms FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admins can manage platforms" ON public.platforms;
    CREATE POLICY "Admins can manage platforms" ON public.platforms FOR ALL USING (public.is_admin());

    -- Dorks
    DROP POLICY IF EXISTS "Dorks are viewable by everyone" ON public.dorks;
    DROP POLICY IF EXISTS "Approved dorks are viewable by everyone" ON public.dorks;
    CREATE POLICY "Approved dorks are viewable by everyone" ON public.dorks FOR SELECT USING (status = 'approved' OR public.is_admin());
    DROP POLICY IF EXISTS "Authenticated users can insert dorks" ON public.dorks;
    CREATE POLICY "Authenticated users can insert dorks" ON public.dorks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    DROP POLICY IF EXISTS "Users can update own dorks" ON public.dorks;
    CREATE POLICY "Users can update own dorks" ON public.dorks FOR UPDATE USING (auth.uid() = author_id);
    DROP POLICY IF EXISTS "Admins can manage all dorks" ON public.dorks;
    CREATE POLICY "Admins can manage all dorks" ON public.dorks FOR ALL USING (public.is_admin());

    -- Votes
    DROP POLICY IF EXISTS "Users can view own votes" ON public.votes;
    CREATE POLICY "Users can view own votes" ON public.votes FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
    CREATE POLICY "Authenticated users can vote" ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    DROP POLICY IF EXISTS "Users can update own votes" ON public.votes;
    CREATE POLICY "Users can update own votes" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Admins can view all votes" ON public.votes;
    CREATE POLICY "Admins can view all votes" ON public.votes FOR SELECT USING (public.is_admin());

    -- Favorites
    DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
    CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);       
    DROP POLICY IF EXISTS "Authenticated users can favorite" ON public.favorites;
    CREATE POLICY "Authenticated users can favorite" ON public.favorites FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
    CREATE POLICY "Users can remove own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;
    CREATE POLICY "Admins can view all favorites" ON public.favorites FOR SELECT USING (public.is_admin());
END
$$;
