// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udcezrcxhpglwkduqiyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkY2V6cmN4aHBnbHdrZHVxaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTE1MDYsImV4cCI6MjA2OTU4NzUwNn0._CftXfgBwEWbAQecYM57nW3VeJ0r27TmqaGTbJuvstY';
export const supabase = createClient(supabaseUrl, supabaseKey);
