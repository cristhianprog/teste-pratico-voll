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

type ScheduleCreateInput = {
  student_id: string;
  scheduled_date: string;
  scheduled_time: string;
  description?: string;
  status?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("schedules")
        .select(`*, students(name, email, phone)`)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as ScheduleCreateInput;

      if (!body.student_id) {
        return res.status(400).json({ message: "O campo 'student_id' é obrigatório." });
      }
      if (!body.scheduled_date) {
        return res.status(400).json({ message: "O campo 'scheduled_date' é obrigatório." });
      }
      if (!body.scheduled_time) {
        return res.status(400).json({ message: "O campo 'scheduled_time' é obrigatório." });
      }

      const payload = {
        student_id: body.student_id,
        scheduled_date: body.scheduled_date,
        scheduled_time: body.scheduled_time,
        description: body.description?.trim() || null,
        status: body.status?.trim() || "Agendado",
      };

      const { data, error } = await supabase
        .from("schedules")
        .insert(payload)
        .select(`*, students(name, email, phone)`)
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
        .from("schedules")
        .update({ status })
        .eq("id", id)
        .select(`*, students(name, email, phone)`)
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : "";
      if (!id) return res.status(400).json({ message: "ID ausente" });

      const { error } = await supabase.from("schedules").delete().eq("id", id);
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
