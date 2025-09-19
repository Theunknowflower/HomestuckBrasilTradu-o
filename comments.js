import { supabase } from "./supabase.js";

export async function loadComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
