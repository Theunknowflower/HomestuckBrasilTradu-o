// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = "Homestucknerdsbrasil@gmail.com";

// ======================
// Navegação entre abas
// ======================
function openTab(id) {
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ======================
// Modais
// ======================
function openModal(id) {
  document.getElementById(id + "Modal").style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id + "Modal").style.display = "none";
}

// ======================
// Login por OTP (e-mail)
// ======================
async function sendOtp() {
  const email = document.getElementById("loginEmail").value.trim();
  if (!email) return alert("Digite seu e-mail!");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert("Erro: " + error.message);
  else alert("Código enviado para " + email);
}
async function verifyOtp() {
  const email = document.getElementById("loginEmail").value.trim();
  const token = document.getElementById("otpCode").value.trim();
  if (!email || !token) return alert("Digite o e-mail e código!");
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) alert("Erro: " + error.message);
  else {
    closeModal("login");
    loadProfile();
  }
}
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ======================
// Perfil + conquistas
// ======================
async function loadProfile() {
  const user = await getCurrentUser();
  const headerUser = document.getElementById("headerUser");
  if (!user) {
    headerUser.innerText = "Convidado";
    document.getElementById("pqContent").innerHTML = "<strong>Sem conta</strong><br><small>Entre com e-mail</small>";
    return;
  }
  headerUser.innerText = user.email;
  document.getElementById("pqContent").innerHTML = `<strong>${user.email}</strong>`;
  if (user.email === ADMIN_EMAIL) {
    document.getElementById("adminThemes").style.display = "block";
  }
  loadUserAchievements();
}
async function loadUserAchievements() {
  const user = await getCurrentUser();
  if (!user) return;
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievements(name, icon_url)")
    .eq("user_id", user.id);
  const list = document.getElementById("savedPopups");
  if (error || !data.length) {
    list.innerHTML = "Nenhuma ainda 😢";
    return;
  }
  list.innerHTML = data.map(a => `
    <div style="display:flex;align-items:center;gap:6px">
      ${a.achievements.icon_url ? `<img src="${a.achievements.icon_url}" width="20">` : "🏆"}
      <span>${a.achievements.name}</span>
    </div>
  `).join("");
}

// ======================
// Leitura + progresso
// ======================
async function savePage() {
  const user = await getCurrentUser();
  if (!user) return alert("Faça login para salvar progresso!");
  const pageMeta = document.getElementById("pageMeta").innerText;
  const match = pageMeta.match(/Página (\d+)/);
  const pageNumber = match ? parseInt(match[1]) : 1;
  await supabase.from("progress").upsert({
    user_id: user.id,
    page: pageNumber,
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
  if (data?.length) openPage(data[0].page);
}
function openPage(page) {
  document.getElementById("readerImg").src = `assets/page-${page}.png`;
  document.getElementById("pageMeta").innerText = `Capítulo 1 — Página ${page}`;
}
function previousPage() { /* lógica similar */ }
function nextPage() { /* lógica similar */ }

// ======================
// Comentários
// ======================
async function loadComments() {
  const { data, error } = await supabase.from("comments").select("*").order("created_at", { ascending: false });
  const section = document.getElementById("commentSection");
  if (error) return section.innerHTML = "Erro ao carregar.";
  section.innerHTML = `
    <textarea id="newComment" placeholder="Escreva..."></textarea>
    <button onclick="addComment()">Enviar</button>
    <div id="commentList">${data.map(c => `<p><b>${c.user}</b>: ${c.text}</p>`).join("")}</div>
  `;
}
async function addComment() {
  const text = document.getElementById("newComment").value.trim();
  if (!text) return;
  const user = await getCurrentUser();
  await supabase.from("comments").insert([{ user: user?.email || "Anônimo", text }]);
  loadComments();
}
function subscribeToComments() {
  supabase.channel("comments")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" },
      payload => {
        const list = document.getElementById("commentList");
        const c = payload.new;
        list.innerHTML = `<p><b>${c.user}</b>: ${c.text}</p>` + list.innerHTML;
      }).subscribe();
}

// ======================
// Fanarts / Fórum
// ======================
async function submitPost() {
  const user = await getCurrentUser();
  if (!user) return alert("Faça login!");
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const image = document.getElementById("postImage").value;
  await supabase.from("posts").insert([{ user_id: user.id, title, content, image_url: image }]);
  loadPosts();
  closeModal("newPost");
}
async function loadPosts() {
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const list = document.getElementById("fanartList");
  list.innerHTML = data.map(p => `
    <div class="post">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%">` : ""}
      <p>${p.content ?? ""}</p>
    </div>
  `).join("");
}

// ======================
// Temas
// ======================
async function loadThemes() {
  const { data } = await supabase.from("themes").select("*");
  const list = document.getElementById("themeList");
  list.innerHTML = data.map(t =>
    `<button onclick="applyTheme('${t.bg}','${t.color}')">${t.name}</button>`
  ).join("");
}
function applyTheme(bg, color) {
  document.documentElement.style.setProperty("--bg-image", `url('${bg}')`);
  document.documentElement.style.setProperty("--accent", color);
}
async function createTheme() {
  const user = await getCurrentUser();
  if (user?.email !== ADMIN_EMAIL) return alert("Somente admin pode criar tema!");
  const name = document.getElementById("themeName").value;
  const bg = document.getElementById("themeBg").value;
  const color = document.getElementById("themeColor").value;
  await supabase.from("themes").insert([{ name, bg, color }]);
  loadThemes();
}

// ======================
// Inicialização
// ======================
loadProfile();
loadProgress();
loadComments();
subscribeToComments();
loadPosts();
loadThemes();
