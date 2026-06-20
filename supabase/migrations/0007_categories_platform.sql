-- Add platform column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'all';

-- Update existing categories to 'all' if they don't have one
UPDATE public.categories SET platform = 'all' WHERE platform IS NULL;
