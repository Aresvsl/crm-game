import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDAxNjQsImV4cCI6MjA4NzM3NjE2NH0.t82PeJJellZf-LPrti8m8amkaefDq4tX9UXYGtrsris';

export const isDemoMode = false;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
