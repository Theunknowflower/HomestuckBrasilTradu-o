// js/achievements.js
async function unlockAchievement(userId, achievementId) {
  await supabase.from("user_achievements").insert([{ user_id: userId, achievement_id: achievementId }]);
}

async function loadAchievements() {
  const user = await getCurrentUser();
  if (!user) return;

  const { data } = await supabase.from("user_achievements")
    .select("*, achievements(title, description)")
    .eq("user_id", user.id);

  const container = document.getElementById("achievementsList");
  container.innerHTML = data.map(a => `
    <div class="achievement">🏆 ${a.achievements.title} — ${a.achievements.description}</div>
  `).join("");
}
