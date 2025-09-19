import { supabase, getUser } from "./supabase.js";

export async function unlockAchievement(achievementName) {
  const user = await getUser();
  if (!user) return;

  const { data: achievement } = await supabase
    .from("achievements")
    .select("id")
    .eq("name", achievementName)
    .single();

  if (!achievement) return;

  const { error } = await supabase
    .from("user_achievements")
    .insert([{ user_id: user.id, achievement_id: achievement.id }]);

  if (error && error.code !== "23505") throw error;
}

export async function loadUserAchievements() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_achievements")
    .select("unlocked_at, achievements(name, icon_url)")
    .eq("user_id", user.id);

  if (error) throw error;
  return data;
}
