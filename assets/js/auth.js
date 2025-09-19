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
    const user = data.user

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError.message)
    }

    // Atualizar UI com nome de exibição
    const displayName = profile?.display_name || user.email
    document.getElementById("headerUser").innerText = displayName

    alert(`Login bem-sucedido! Bem-vindo ${displayName}`)
  }
}

// Sair
async function signOut() {
  await supabase.auth.signOut()
  alert("Você saiu da conta.")
  document.getElementById("headerUser").innerText = "Convidado"
}

// Expor funções pro HTML
window.signUpEmail = signUpEmail
window.signInEmail = signInEmail
window.signOut = signOut

