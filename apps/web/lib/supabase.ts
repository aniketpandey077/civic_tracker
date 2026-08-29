import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vjnsbpituwagvvmlvrum.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnNicGl0dXdhZ3Z2bWx2cnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDQ5NzYsImV4cCI6MjEwMzU4MDk3Nn0.WSjZp2OmESaCT6yH56-7ZobTFN3N1ioyJI9CEnuvSgA';

// Singleton browser client — safe to import anywhere (client components, API routes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Server-side admin client (only for API routes — NEVER import in client components)
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
