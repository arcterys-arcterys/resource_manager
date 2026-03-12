import { createClient } from '@supabase/supabase-js'

// Replace these two values with your own from:
// Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://oqdrnqjndmzhjkxkamdc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZHJucWpuZG16aGpreGthbWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDE2MzgsImV4cCI6MjA4ODkxNzYzOH0.JGH7imZ8PnN7UBmGMITGj26U9c3yIUbI7NF1_TBVUbI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
