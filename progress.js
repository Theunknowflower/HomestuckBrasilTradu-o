// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import { supabase, getUser } from "./supabase.js";

export async function savePage(pageNumber) {
  const user = await getUser();
  if (!user) throw new Error("Usuário não logado");

  const { error } = await supabase.from("progress").upsert({
    user_id: user.id,
    page: pageNumber,
    updated_at: new Date().toISOString()
  });

  if (error) throw error;
}

export async function loadProgress() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("progress")
    .select("page")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data.length ? data[0].page : null;
}
