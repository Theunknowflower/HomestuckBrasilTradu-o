// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 

let currentPage = 1;
let user = null; // usuário logado

// =========================
// LOGIN COM OTP (link mágico)
// =========================
async function loginWithOTP() {
  const email = prompt("Digite seu e-mail para receber o link mágico:");
  if (!email) return;

  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    alert("Erro ao enviar o link: " + error.message);
    return;
  }

  alert("Link enviado! Confira seu e-mail para entrar.");
}

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Tabs
function openTab(id) {
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

// ================= LOGIN =================
async function loginWithOTP() {
  const email = prompt("Digite seu e-mail:");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert(error.message); else alert("Link enviado! Verifique seu e-mail.");
}
async function loginWithPassword() {
  const email = prompt("Email:");
  const password = prompt("Senha:");
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message); else updateUser(data.user);
}
async function signUpWithPassword() {
  const email = prompt("Email:");
  const password = prompt("Senha:");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message); else alert("Conta criada!");
}
async function logout() {
  await supabase.auth.signOut();
  document.getElementById("username").innerText = "Convidado";
  document.getElementById("logoutBtn").style.display = "none";
}
function updateUser(user) {
  if (!user) return;
  document.getElementById("username").innerText = user.email;
  document.getElementById("logoutBtn").style.display = "inline-block";
}

// ================= COMENTÁRIOS =================
async function addComment() {
  const text = document.getElementById("commentBox").value;
  const user = (await supabase.auth.getUser()).data.user;
  if (!text) return;
  await supabase.from("comments").insert({
    page_id: "pagina_atual",
    user_id: user?.id || null,
    body: text,
    author_name: user?.email || "Anônimo"
  });
  document.getElementById("commentBox").value = "";
  loadComments();
}
async function loadComments() {
  const { data } = await supabase.from("comments").select("*").eq("page_id", "pagina_atual").order("created_at", { ascending: false });
  const list = document.getElementById("commentList");
  list.innerHTML = data.map(c => `<p><b>${c.author_name}:</b> ${c.body}</p>`).join("");
}
loadComments();

// ================= PROGRESSO =================
async function saveProgress() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Faça login!");
  await supabase.from("progress").upsert({ user_id: user.id, page_id: "pagina_atual" });
  alert("Progresso salvo!");
}
function prevPage() { alert("Voltar página (ainda não implementado)"); }
function nextPage() { alert("Avançar página (ainda não implementado)"); }

// ================= COMUNIDADE / FANARTS =================
async function submitPost() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Você precisa estar logado!");
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const image_url = document.getElementById("postImage").value;

  const { error } = await supabase.from("posts").insert([{ user_id: user.id, title, content, image_url }]);
  if (error) {
    alert("Erro ao publicar: " + error.message);
  } else {
    alert("Post publicado!");
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    loadPosts();
  }
}
async function loadPosts() {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const container = document.getElementById("communityPosts");
  if (error) {
    container.innerHTML = "Erro ao carregar posts.";
    return;
  }
  container.innerHTML = data.map(p => `
    <div class="post">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%;border-radius:6px">` : ""}
      <p>${p.content ?? ""}</p>
      <small>${new Date(p.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}
loadPosts();

// =========================
// ATUALIZA INTERFACE
// =========================
function updateUIAfterLogin() {
  if (user) {
    document.getElementById("user-info").innerText = user.email;
    document.getElementById("auth-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
  } else {
    document.getElementById("user-info").innerText = "Usuário";
    document.getElementById("auth-btn").style.display = "inline-block";
    document.getElementById("logout-btn").style.display = "none";
  }
}

// =========================
// LEITURA DAS PÁGINAS
// =========================
async function loadPage(pageNumber) {
  currentPage = pageNumber;
  const pageBox = document.getElementById("page-content");
  pageBox.innerHTML = "<p>Carregando...</p>";

  // Exemplo: puxando de uma tabela "pages" no Supabase
  const res = await fetch(`${API_URL}/pages?id=eq.${pageNumber}`, {
    headers: { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` }
  });
  const data = await res.json();

  if (data.length > 0) {
    pageBox.innerHTML = `
      <img src="${data[0].image}" alt="Página">
      <p>${data[0].text}</p>
    `;

    // desbloquear conquista da primeira página
    if (pageNumber === 1) unlockAchievement("primeira_pagina");
  } else {
    pageBox.innerHTML = "<p>Página não encontrada.</p>";
  }
}

function prevPage() {
  if (currentPage > 1) loadPage(currentPage - 1);
}

function nextPage() {
  loadPage(currentPage + 1);
}

function savePage() {
  if (!user) return alert("Faça login para salvar!");
  alert(`Página ${currentPage} salva! (em breve vamos guardar no banco)`);
}

// =========================
// COMENTÁRIOS
// =========================
async function sendComment() {
  if (!user) return alert("Faça login para comentar!");
  const text = document.getElementById("commentBox").value;
  if (!text) return;

  await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      page_id: currentPage,
      user_id: user.id,
      text
    })
  });

  document.getElementById("commentBox").value = "";
  loadComments(currentPage);
}

async function loadComments(pageNumber) {
  const res = await fetch(`${API_URL}/comments?page_id=eq.${pageNumber}`, {
    headers: { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` }
  });
  const comments = await res.json();

  const list = document.getElementById("commentList");
  list.innerHTML = comments
    .map(c => `<p><b>${c.user_id}</b>: ${c.text}</p>`)
    .join("");
}

// =========================
// CONQUISTAS
// =========================
function unlockAchievement(key) {
  const achList = document.getElementById("achievements-list");
  if (key === "primeira_pagina") {
    achList.innerHTML += `
      <div class="achievement">
        <img src="assets/conquista1.png" alt="Conquista">
        <p><b>Primeira página</b><br>Leu à primeira página</p>
      </div>
    `;
  }
}

// =========================
// EVENTOS INICIAIS
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // botões
  document.getElementById("auth-btn").onclick = login;
  document.getElementById("logout-btn").onclick = logout;

  // checar login
  checkUser();

  // carregar primeira página
  loadPage(1);

  // carregar comentários
  loadComments(1);
});


