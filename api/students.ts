import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} ausente`);
  return value;
}

const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
);

type StudentCreateInput = {
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  plan?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as StudentCreateInput;

      if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
        return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
      }

      const payload = {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        status: body.status?.trim() || "Ativo",
        plan: body.plan?.trim() || null,
      };

      const { data, error } = await supabase
        .from("students")
        .insert(payload)
        .select("*")
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : "";
      if (!id) return res.status(400).json({ message: "ID ausente" });

      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) return res.status(500).json({ message: error.message });

      return res.status(204).send("");
    }

    res.setHeader("Allow", "GET,POST,DELETE");
    return res.status(405).json({ message: "Método não permitido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro inesperado" });
  }
}
