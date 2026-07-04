#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
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
`;

async function runMigration() {
  try {
    console.log('[v0] Running migrations...');
    
    const { error } = await supabase.rpc('exec', {
      sql: migrationSQL
    }).catch(async () => {
      // If rpc doesn't work, try direct SQL execution via admin API
      console.log('[v0] RPC not available, trying direct SQL execution...');
      
      // Split SQL into individual statements
      const statements = migrationSQL.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        const { error: execError } = await supabase.rpc('exec', {
          sql: statement
        }).catch(() => {
          // Fallback: log that we need to run SQL manually
          return { error: { message: 'RPC not available' } };
        });
        
        if (execError?.message === 'RPC not available') {
          console.log('[v0] Note: RPC function not available');
          console.log('[v0] Please run the following SQL in your Supabase dashboard:');
          console.log('[v0] SQL Editor > New Query > Paste the migration SQL');
          return { error: { message: 'RPC not configured' } };
        }
      }
      
      return { error: null };
    });

    if (error) {
      console.error('[v0] Migration error:', error);
      process.exit(1);
    }

    console.log('[v0] Migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[v0] Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
