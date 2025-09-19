// auth.js

// Abre e fecha modais
function openModal(id) {
  document.getElementById(id + "Modal").style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id + "Modal").style.display = "none";
}

// LOGIN com OTP (link mágico enviado por e-mail)
async function loginWithOTP() {
  const email = prompt("Digite seu e-mail para receber o link mágico:");
  if (!email) return;

  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    alert("Erro ao enviar link mágico: " + error.message);
  } else {
    alert("Verifique seu e-mail! Um link mágico foi enviado 🚀");
  }
}

// LOGIN com usuário/senha
async function loginWithPassword() {
  const email = prompt("Digite seu e-mail:");
  const password = prompt("Digite sua senha:");
  if (!email || !password) return;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Erro: " + error.message);
  } else {
    alert("Login feito com sucesso! 🎉");
    closeModal("login");
    loadUserProfile(data.user);
  }
}

// CRIAR conta com usuário/senha
async function signUpWithPassword() {
  const email = prompt("Digite seu e-mail:");
  const password = prompt("Digite sua senha:");
  const username = prompt("Escolha um nome de usuário:");
  if (!email || !password || !username) return;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    alert("Erro ao criar conta: " + error.message);
  } else {
    alert("Conta criada! Verifique seu e-mail 📩");
    // cria perfil inicial
    await supabase.from("profiles").insert([
      { id: data.user.id, username: username },
    ]);
  }
}

// LOGOUT
async function logout() {
  await supabase.auth.signOut();
  alert("Você saiu da conta 👋");
}

// Carregar perfil após login
async function loadUserProfile(user) {
  if (!user) return;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.log("Erro ao buscar perfil:", error);
    return;
  }

  // exemplo de exibição
  const profileBox = document.getElementById("profileBox");
  if (profileBox) {
    profileBox.innerHTML = `
      <h3>@${data.username}</h3>
      <p>${data.bio || "Sem bio ainda..."}</p>
      <button onclick="logout()">Sair</button>
    `;
  }
}
