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
