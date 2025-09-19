export function renderAchievements(list) {
  const container = document.getElementById("savedPopups");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = "Nenhuma ainda 😢";
    return;
  }

  container.innerHTML = list.map(ua => `
    <div class="achievement">
      ${ua.achievements.icon_url 
        ? `<img src="${ua.achievements.icon_url}" class="icon">` 
        : "🏆"}
      <span>${ua.achievements.name}</span>
    </div>
  `).join("");
}
