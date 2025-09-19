// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import { supabase, getUser } from "./supabase.js";
import { unlockAchievement } from "./achievements.js";

export async function submitPost(title, content, image_url) {
  const user = await getUser();
  if (!user) throw new Error("Usuário não logado");

  const { error } = await supabase
    .from("posts")
    .insert([{ user_id: user.id, title, content, image_url }]);

  if (error) throw error;

  await unlockAchievement("Primeira fanart");
}

export async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, image_url, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
