-- Add icon column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Terminal';

-- Update existing categories with default icons if they match our metadata
UPDATE public.categories SET icon = 'FileText' WHERE name = 'Sensitive Files';
UPDATE public.categories SET icon = 'Lock' WHERE name = 'Admin Panels';
UPDATE public.categories SET icon = 'Bug' WHERE name = 'Vulnerability Research';
UPDATE public.categories SET icon = 'Cloud' WHERE name = 'Cloud Leaks';
UPDATE public.categories SET icon = 'Camera' WHERE name = 'IoT & Surveillance';
UPDATE public.categories SET icon = 'Network' WHERE name = 'Network Scans';
UPDATE public.categories SET icon = 'Database' WHERE name = 'Database Leaks';
UPDATE public.categories SET icon = 'Folder' WHERE name = 'Index Of';
UPDATE public.categories SET icon = 'Key' WHERE name = 'Tokens & Keys';
UPDATE public.categories SET icon = 'Shield' WHERE name = 'Security Protocols';
UPDATE public.categories SET icon = 'Terminal' WHERE name = 'Shell Access';
UPDATE public.categories SET icon = 'Zap' WHERE name = 'SQL Injection';
UPDATE public.categories SET icon = 'Cpu' WHERE name = 'Custom Exploit';
