import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://SEU-PROJETO.supabase.co",
  "PUBLIC-ANON-KEY"
);

// helper para pegar usuário logado
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

