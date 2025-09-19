import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://vhopcdzemdiqtvrwmqqo.supabase.co", // troque pelo seu
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"                  // troque pelo seu
);

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
