
import { createClient } from '@supabase/supabase-js';

// NOTE: In a standard project, you should use environment variables (e.g., process.env.SUPABASE_URL).
// However, in this specific browser-based environment, we are placing the values directly here for simplicity and to resolve the configuration error.
const supabaseUrl = 'https://wqhddgrtnkicfyvizuje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaGRkZ3J0bmtpY2Z5dml6dWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDc0NDQsImV4cCI6MjA4NDE4MzQ0NH0.mVoRUOzhOuoe75rMbBUOtR7H3LoobneqnUCpKeaK0uQ';

if (!supabaseUrl) {
    throw new Error("Configuration error: The Supabase URL is missing. Please ensure the SUPABASE_URL environment variable is set.");
}
if (!supabaseAnonKey) {
    throw new Error("Configuration error: The Supabase anonymous key is missing. Please ensure the SUPABASE_ANON_KEY environment variable is set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);