-- Create platforms table
CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    icon TEXT DEFAULT 'Globe',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Platforms are viewable by everyone" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Admins can manage platforms" ON public.platforms 
    FOR ALL 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Seed initial platforms
INSERT INTO public.platforms (name, slug, base_url, icon) VALUES
('Google', 'google', 'https://www.google.com/search?q=', 'Globe'),
('Bing', 'bing', 'https://www.bing.com/search?q=', 'Search'),
('Shodan', 'shodan', 'https://www.shodan.io/search?query=', 'Terminal'),
('Censys', 'censys', 'https://search.censys.io/search?resource=hosts&q=', 'Cpu')
ON CONFLICT (slug) DO NOTHING;
