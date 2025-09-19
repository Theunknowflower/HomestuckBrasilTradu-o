// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


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
