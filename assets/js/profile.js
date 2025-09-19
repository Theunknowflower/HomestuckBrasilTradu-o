// js/profiles.js
async function loadProfile() {
  const user = await getCurrentUser();
  const container = document.getElementById("profileBox");

  if (!user) {
    container.innerHTML = "<p>Você não está logado.</p>";
    return;
  }

  let { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!data) {
    // cria perfil vazio se não existir
    await supabase.from("profiles").insert([{ id: user.id, username: user.email }]);
    data = { username: user.email, bio: "" };
  }

  container.innerHTML = `
    <h3>@${data.username}</h3>
    <p>${data.bio || "Sem descrição ainda."}</p>
  `;
}
