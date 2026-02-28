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
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type FinancialCreateInput = {
  type: "receita" | "despesa";
  description: string;
  amount: number;
  due_date: string;
  status?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("financial_entries")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as FinancialCreateInput;

      if (!body.type || !["receita", "despesa"].includes(body.type)) {
        return res.status(400).json({ message: "O campo 'type' deve ser 'receita' ou 'despesa'." });
      }
      if (!body.description || body.description.trim().length < 2) {
        return res.status(400).json({ message: "O campo 'description' é obrigatório." });
      }
      if (body.amount == null || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
        return res.status(400).json({ message: "O campo 'amount' deve ser um número positivo." });
      }
      if (!body.due_date) {
        return res.status(400).json({ message: "O campo 'due_date' é obrigatório." });
      }

      const payload = {
        type: body.type,
        description: body.description.trim(),
        amount: Number(body.amount),
        due_date: body.due_date,
        status: body.status?.trim() || "Pendente",
      };

      const { data, error } = await supabase
        .from("financial_entries")
        .insert(payload)
        .select("*")
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    }

    if (req.method === "PATCH") {
      const id = typeof req.query.id === "string" ? req.query.id : "";
      if (!id) return res.status(400).json({ message: "ID ausente" });

      const { status } = req.body as { status: string };
      if (!status) return res.status(400).json({ message: "Campo 'status' ausente" });

      const { data, error } = await supabase
        .from("financial_entries")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : "";
      if (!id) return res.status(400).json({ message: "ID ausente" });

      const { error } = await supabase.from("financial_entries").delete().eq("id", id);
      if (error) return res.status(500).json({ message: error.message });
      return res.status(204).send("");
    }

    res.setHeader("Allow", "GET,POST,PATCH,DELETE");
    return res.status(405).json({ message: "Método não permitido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro inesperado" });
  }
}
