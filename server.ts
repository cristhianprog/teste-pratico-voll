import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { supabase } from "./src/server/supabaseClient";

type StudentCreateInput = {
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  plan?: string;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Listar
  app.get("/api/students", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.json(data ?? []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });


  // Criar
  app.post("/api/students", async (req, res) => {
    try {
      const body = req.body as StudentCreateInput;

      if (!body?.name || typeof body.name !== "string" || body.name.trim().length < 2) {
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

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(201).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  // Deletar aluno
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = req.params.id ?? (req.query.id as string);

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "ID inválido" });
      }

      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  // ── Agenda ────────────────────────────────────────────────────────────────

  app.get("/api/schedules", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*, students(name, email, phone)")
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data ?? []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const { student_id, scheduled_date, scheduled_time, description, status } = req.body ?? {};
      if (!student_id) return res.status(400).json({ message: "student_id é obrigatório" });
      if (!scheduled_date) return res.status(400).json({ message: "scheduled_date é obrigatório" });
      if (!scheduled_time) return res.status(400).json({ message: "scheduled_time é obrigatório" });

      const { data, error } = await supabase
        .from("schedules")
        .insert({ student_id, scheduled_date, scheduled_time, description: description?.trim() || null, status: status || "Agendado" })
        .select("*, students(name, email, phone)")
        .single();
      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.patch("/api/schedules/:id", async (req, res) => {
    try {
      const id = req.params.id ?? (req.query.id as string);
      const { status } = req.body ?? {};
      if (!id) return res.status(400).json({ message: "ID ausente" });
      if (!status) return res.status(400).json({ message: "status ausente" });

      const { data, error } = await supabase
        .from("schedules").update({ status }).eq("id", id)
        .select("*, students(name, email, phone)").single();
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const id = req.params.id ?? (req.query.id as string);
      if (!id) return res.status(400).json({ message: "ID ausente" });
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) return res.status(500).json({ message: error.message });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  // ── Financeiro ────────────────────────────────────────────────────────────

  app.get("/api/financial", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("financial_entries")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data ?? []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.post("/api/financial", async (req, res) => {
    try {
      const { type, description, amount, due_date, status } = req.body ?? {};
      if (!type || !["receita", "despesa"].includes(type))
        return res.status(400).json({ message: "type inválido" });
      if (!description || description.trim().length < 2)
        return res.status(400).json({ message: "description é obrigatório" });
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
        return res.status(400).json({ message: "amount inválido" });
      if (!due_date)
        return res.status(400).json({ message: "due_date é obrigatório" });

      const { data, error } = await supabase
        .from("financial_entries")
        .insert({ type, description: description.trim(), amount: Number(amount), due_date, status: status || "Pendente" })
        .select("*").single();
      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.patch("/api/financial/:id", async (req, res) => {
    try {
      const id = req.params.id ?? (req.query.id as string);
      const { status } = req.body ?? {};
      if (!id) return res.status(400).json({ message: "ID ausente" });
      if (!status) return res.status(400).json({ message: "status ausente" });

      const { data, error } = await supabase
        .from("financial_entries").update({ status }).eq("id", id).select("*").single();
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  app.delete("/api/financial/:id", async (req, res) => {
    try {
      const id = req.params.id ?? (req.query.id as string);
      if (!id) return res.status(400).json({ message: "ID ausente" });
      const { error } = await supabase.from("financial_entries").delete().eq("id", id);
      if (error) return res.status(500).json({ message: error.message });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro inesperado" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VOLL Candidate rodando em http://localhost:${PORT}`);
  });
}

startServer();
