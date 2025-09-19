import { supabase, getUser } from "./supabase.js";

export async function loadProfile() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates) {
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;
}
