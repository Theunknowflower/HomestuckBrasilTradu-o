
// Registrar nova conta
async function signUpEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) {
    alert("Erro ao registrar: " + error.message)
    console.error(error)
  } else {
    alert("Conta criada! Confirme o e-mail antes de entrar.")
  }
}

// Entrar com conta existente
async function signInEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    alert("Erro ao entrar: " + error.message)
    console.error(error)
  } else {
    alert("Login bem-sucedido!")
  }
}

// Tornar acessível ao HTML
window.signUpEmail = signUpEmail
window.signInEmail = signInEmail
