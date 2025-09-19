// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 

let currentPage = 1;
let user = null; // usuário logado

// =========================
// AUTENTICAÇÃO
// =========================
async function login() {
  // Exemplo com Supabase + Email (pode adaptar depois para Google OAuth)
  const email = prompt("Digite seu e-mail:");
  if (!email) return;

  const { data, error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    alert("Erro ao logar: " + error.message);
    return;
  }

  alert("Verifique seu e-mail para entrar!");
}

async function checkUser() {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    user = data.user;
    document.getElementById("user-info").innerText = user.email;
    document.getElementById("auth-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
  }
}

async function logout() {
  await supabase.auth.signOut();
  user = null;
  document.getElementById("user-info").innerText = "Usuário";
  document.getElementById("auth-btn").style.display = "inline-block";
  document.getElementById("logout-btn").style.display = "none";
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


