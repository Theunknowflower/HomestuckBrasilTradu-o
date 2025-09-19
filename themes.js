// carregar lista de temas do Supabase
async function loadThemes() {
  const { data, error } = await supabase.from("themes").select("*");
  if (error) {
    console.error("Erro ao carregar temas:", error);
    return;
  }

  const selector = document.getElementById("themeSelector");
  selector.innerHTML = '<option value="">Selecione um tema</option>';

  data.forEach(theme => {
    const opt = document.createElement("option");
    opt.value = theme.id;
    opt.textContent = theme.name;
    selector.appendChild(opt);
  });

  // aplica tema salvo do perfil
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("theme_id")
      .eq("id", user.id)
      .single();

    if (profile && profile.theme_id) {
      selector.value = profile.theme_id;
      applyTheme(profile.theme_id);
    }
  }
}

// aplicar tema selecionado
async function applyTheme(themeId) {
  if (!themeId) return;

  const { data: theme, error } = await supabase
    .from("themes")
    .select("*")
    .eq("id", themeId)
    .single();

  if (error) {
    console.error("Erro ao aplicar tema:", error);
    return;
  }

  // aplicar CSS no site
  document.body.style.backgroundImage = `url(${theme.wallpaper_url})`;
  document.body.style.backgroundColor = theme.bg_color || "#000";
  document.body.style.color = theme.text_color || "#fff";
  document.querySelectorAll("button, .card").forEach(el => {
    el.style.borderColor = theme.accent_color || "#0f0";
  });

  // salvar escolha no perfil
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").update({ theme_id: themeId }).eq("id", user.id);
  }
}
