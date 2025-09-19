// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
