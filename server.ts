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

  // Deletar
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;

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

  console.log('process.env.NODE_ENV :', process.env.NODE_ENV);

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
