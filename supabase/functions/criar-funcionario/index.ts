// Edge Function: criar-funcionario
// Cria um novo funcionário (login + perfil) com segurança.
// Só quem já está logado como "admin" ou "gestao" consegue usar isso —
// a chave mestra do banco (service role) nunca sai deste arquivo,
// nunca chega ao navegador.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const responder = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return responder({ error: "Não autenticado." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Cliente "como o usuário que chamou" — só para confirmar quem é e seu papel
    const supabaseUsuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: erroUsuario } = await supabaseUsuario.auth.getUser();
    if (erroUsuario || !user) return responder({ error: "Sessão inválida. Faça login novamente." }, 401);

    const { data: perfil } = await supabaseUsuario.from("perfis").select("papel").eq("id", user.id).single();
    if (!perfil || !["admin", "gestao"].includes(perfil.papel)) {
      return responder({ error: "Seu usuário não tem permissão para cadastrar funcionários." }, 403);
    }

    const { nome, cpf, email, senha, papel } = await req.json();
    if (!nome?.trim() || !email?.trim() || !senha || !papel) {
      return responder({ error: "Preencha nome, e-mail, senha e função." }, 400);
    }
    if (senha.length < 6) return responder({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
    if (papel === "admin" && perfil.papel !== "admin") {
      return responder({ error: "Somente um administrador pode cadastrar outro administrador." }, 403);
    }

    // Cliente com privilégio total — só existe aqui dentro do servidor
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: novo, error: erroCriar } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: senha,
      email_confirm: true,
      user_metadata: { nome: nome.trim(), cpf: cpf?.trim() || null, papel },
    });

    if (erroCriar) return responder({ error: erroCriar.message }, 400);

    return responder({ ok: true, id: novo.user.id });
  } catch (e) {
    return responder({ error: String(e?.message || e) }, 500);
  }
});
