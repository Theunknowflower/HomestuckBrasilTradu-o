
// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { supabase } from "./supabase.js";

export async function loadComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
