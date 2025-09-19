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

export function renderPosts(posts) {
  const list = document.getElementById("fanartList");
  if (!list) return;

  if (!posts.length) {
    list.innerHTML = "<p style='color:#666'>Nenhuma fanart ainda.</p>";
    return;
  }

  list.innerHTML = posts.map(p => `
    <div class="post">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" class="post-image">` : ""}
      <p>${p.content ?? ""}</p>
      <small>${new Date(p.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}
