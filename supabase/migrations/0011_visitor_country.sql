-- Add country_code column to page_views table
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Create policy to allow public inserts to set country_code
-- (The insert policy doesn't restrict columns, so we don't need changes there)

-- Create a secure RPC function to get unique visitor counts grouped by country
CREATE OR REPLACE FUNCTION public.get_visitor_stats_by_country()
RETURNS TABLE (country_code TEXT, visitor_count bigint) AS $$
BEGIN
    -- Check if the executing user is an admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: User is not an admin';
    END IF;

    RETURN QUERY
    SELECT 
        p.country_code,
        COUNT(DISTINCT p.session_id) AS visitor_count
    FROM public.page_views p
    WHERE p.country_code IS NOT NULL
    GROUP BY p.country_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
