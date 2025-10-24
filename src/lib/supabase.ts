import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmgwdfhutyojisypljcz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZ3dkZmh1dHlvamlzeXBsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDk0MzUsImV4cCI6MjA3NTY4NTQzNX0.-lDn6N4yY_n78ZKpiH_49O6-PA5aJUXCUDsHI5K6_Gw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
