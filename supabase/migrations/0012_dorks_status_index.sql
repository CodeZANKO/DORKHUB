-- Create index on dorks status to speed up queries filtering by approved or pending status
CREATE INDEX IF NOT EXISTS dorks_status_idx ON public.dorks (status);
