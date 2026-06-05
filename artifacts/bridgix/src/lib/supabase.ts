import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jpaiwfswodjsvdgzynyl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYWl3ZnN3b2Rqc3ZkZ3p5bnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDUyNTYsImV4cCI6MjA5NjE4MTI1Nn0.K71sxGIMqbe879tSGpAVCiwMF-JlLeSqcD3WqI2x-tQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
