
// === LOGIN E CADASTRO COM EMAIL + SENHA ===

// Criar conta
async function signUpEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) {
    console.error("Erro ao registrar:", error.message)
    alert("Erro ao registrar: " + error.message)
  } else {
    alert("Conta criada! Verifique seu e-mail antes de entrar.")
  }
}

// Entrar
async function signInEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    console.error("Erro no login:", error.message)
    alert("Erro no login: " + error.message)
  } else {
    alert("Login bem-sucedido! Bem-vindo " + email)
    document.getElementById("headerUser").innerText = email
  }
}

// Sair
async function signOut() {
  await supabase.auth.signOut()
  alert("Você saiu da conta.")
  document.getElementById("headerUser").innerText = "Convidado"
}

// Expor pro HTML
window.signUpEmail = signUpEmail
window.signInEmail = signInEmail
window.signOut = signOut
