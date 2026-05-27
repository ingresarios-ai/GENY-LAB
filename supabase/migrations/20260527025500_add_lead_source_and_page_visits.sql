-- Add lead_source column to enrolled_users
ALTER TABLE public.enrolled_users ADD COLUMN IF NOT EXISTS lead_source TEXT;

-- Create page_visits table
CREATE TABLE IF NOT EXISTS public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  ip_country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for page_visits
DROP POLICY IF EXISTS "Allow public insert on page_visits" ON public.page_visits;
CREATE POLICY "Allow public insert on page_visits" ON public.page_visits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select on page_visits for all" ON public.page_visits;
CREATE POLICY "Allow select on page_visits for all" ON public.page_visits
  FOR SELECT USING (true);
