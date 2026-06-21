-- Create page_views table to track visitor page views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    path TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow public users (including non-logged in visitors) to log page views
CREATE POLICY "Allow public inserts on page_views" ON public.page_views
    FOR INSERT 
    WITH CHECK (true);

-- Allow only admins to select page views directly
CREATE POLICY "Allow admin select on page_views" ON public.page_views
    FOR SELECT 
    USING (public.is_admin());

-- Create a secure RPC function to get the count of unique visitors (sessions)
CREATE OR REPLACE FUNCTION public.get_unique_visitors_count()
RETURNS bigint AS $$
BEGIN
    -- Check if the executing user is an admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: User is not an admin';
    END IF;

    RETURN (
        SELECT COUNT(DISTINCT session_id)
        FROM public.page_views
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
