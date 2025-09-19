// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = "Homestucknerdsbrasil@gmail.com";
// ======================
// PÁGINAS
// ======================
let pages = [];
let currentPage = 1;

fetch("data/pages.json")
  .then(r => r.json())
  .then(data => {
    pages = data;
    loadProgress(); // tenta abrir última página salva
    loadIndex();
  });

function openPage(num) {
  const page = pages.find(p => p.page === num);
  if (!page) return;
  currentPage = num;

  document.getElementById("readerImg").src = page.type === "image" ? page.src : "";
  document.getElementById("pageEmbed").src = page.type === "swf" ? page.src : "";
  document.getElementById("pageMeta").innerText = `Capítulo ${page.chapter} • Página ${page.page}`;
}

function previousPage() { if (currentPage > 1) openPage(currentPage - 1); }
function nextPage() { if (currentPage < pages.length) openPage(currentPage + 1); }
function toggleEmbed() {
  const wrap = document.getElementById("embedWrap");
  wrap.style.display = wrap.style.display === "none" ? "block" : "none";
}

function loadIndex() {
  const list = document.getElementById("indexList");
  list.innerHTML = pages.map(p => 
    `<div><a href="#" onclick="openPage(${p.page});return false">Capítulo ${p.chapter} — Página ${p.page}</a></div>`
  ).join("");
}

// ======================
// LOGIN (OTP EMAIL)
// ======================
async function signInEmail() {
  const email = prompt("Digite seu email:");
  if (!email) return;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert("Erro: " + error.message);
  else alert("Um link foi enviado para seu email.");
}

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ======================
// PROGRESSO
// ======================
async function savePage() {
  const user = await getCurrentUser();
  if (!user) {
    alert("Faça login para salvar progresso!");
    return;
  }
  await supabase.from("progress").upsert({
    user_id: user.id,
    page: currentPage,
    updated_at: new Date().toISOString()
  });
  alert("Progresso salvo!");
}

async function loadProgress() {
  const user = await getCurrentUser();
  if (!user) return;
  const { data } = await supabase
    .from("progress")
    .select("page")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (data && data.length > 0) openPage(data[0].page);
}

// ======================
// COMENTÁRIOS
// ======================
async function loadComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("commentSection");
  if (error) {
    container.innerHTML = "Erro ao carregar comentários.";
    return;
  }

  container.innerHTML = `
    <div id="commentForm" style="margin-bottom:12px">
      <textarea id="newComment" placeholder="Escreva..." style="width:100%;height:60px"></textarea>
      <button onclick="addComment()">Enviar</button>
    </div>
    <div id="commentList">
      ${data.map(c => `<div><strong>${c.user}</strong>: ${c.text}</div>`).join("")}
    </div>
  `;
}

async function addComment() {
  const textarea = document.getElementById("newComment");
  const text = textarea.value.trim();
  if (!text) return;
  const user = await getCurrentUser();
  const username = user ? user.email : "Convidado";
  await supabase.from("comments").insert([{ user: username, text }]);
  textarea.value = "";
}

function subscribeToComments() {
  supabase.channel("comments-channel")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" },
      payload => {
        const list = document.getElementById("commentList");
        if (!list) return;
        const c = payload.new;
        const div = document.createElement("div");
        div.innerHTML = `<strong>${c.user}</strong>: ${c.text}`;
        list.prepend(div);
      }
    ).subscribe();
}

// ======================
// FANARTS / FÓRUM
// ======================
async function loadFanarts() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = document.getElementById("fanartList");
  list.innerHTML = data.length
    ? data.map(p => `<div><h4>${p.title}</h4><img src="${p.image_url}" style="max-width:100%"><p>${p.content}</p></div>`).join("")
    : "Nenhuma fanart ainda.";
}

async function submitPost() {
  const user = await getCurrentUser();
  if (!user) return alert("Faça login!");
  const title = prompt("Título da fanart:");
  const url = prompt("URL da imagem:");
  await supabase.from("posts").insert([{ user_id: user.id, title, image_url: url }]);
  loadFanarts();
}

// ======================
// CONQUISTAS
// ======================
async function loadAchievements() {
  const user = await getCurrentUser();
  if (!user) return;
  const { data } = await supabase
    .from("user_achievements")
    .select("achievements(name,icon_url)")
    .eq("user_id", user.id);
  const list = document.getElementById("achievementsList");
  list.innerHTML = data.length
    ? data.map(a => `<div>🏆 ${a.achievements.name}</div>`).join("")
    : "Nenhuma conquista.";
}

// ======================
// INICIALIZAÇÃO
// ======================
window.onload = () => {
  loadComments();
  subscribeToComments();
  loadFanarts();
  loadAchievements();
};
