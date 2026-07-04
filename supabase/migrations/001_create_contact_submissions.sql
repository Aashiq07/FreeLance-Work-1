-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON public.contact_submissions(email);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow inserts (contact form submissions)
CREATE POLICY "Allow anonymous inserts" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Create RLS policy to allow service role to read all submissions
CREATE POLICY "Allow service role to read all" ON public.contact_submissions
  FOR SELECT TO service_role USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT ON public.contact_submissions TO service_role;
