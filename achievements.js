// achievements.js

async function loadAchievements() {
  const { data: { user } } = await supabase.auth.getUser();
  const container = document.getElementById("achievements");

  if (!user) {
    container.innerHTML = "Entre para ver conquistas.";
    return;
  }

  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievements(name, icon_url)")
    .eq("user_id", user.id);

  if (error) {
    container.innerHTML = "Erro ao carregar conquistas.";
    return;
  }

  container.innerHTML = data.length
    ? data.map(a => `
      <div> ${a.achievements.icon_url ? `<img src="${a.achievements.icon_url}" width="20">` : "🏆"} ${a.achievements.name}</div>
    `).join("")
    : "Nenhuma conquista ainda.";
}

async function unlockAchievement(userId, achievementName) {
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id")
    .eq("name", achievementName)
    .single();

  if (!achievement) return;

  await supabase.from("user_achievements").insert([{ 
    user_id: userId, achievement_id: achievement.id 
  }]);
}
