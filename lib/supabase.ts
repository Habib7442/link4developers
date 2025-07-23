import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
// For development purposes, we're hardcoding them here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;