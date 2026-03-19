import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2FzZSIsInJlZiI6a3J2ZGl4YWRraXFhd2x3dGRuamMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODc0MDM4MSwiZXhwIjoyMDU0MzE2MzgxfQ.f7N-6P7Z1_q-qW5_0_Q-9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9';

export const isDemoMode = false;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
