const { Router } = require("express");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const repo = require("./repository");

const routes = Router();

// POST /auth — login
routes.post("/auth", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  const user = repo.findByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

// GET /users — list all users
routes.get("/users", auth, (req, res) => {
  res.json(repo.findAll());
});

// POST /users — create user
routes.post("/users", auth, (req, res) => {
  const { name, email, type, password } = req.body;
  if (!name || !email || !type || !password) {
    return res.status(400).json({ error: "Campos name, email, type e password são obrigatórios" });
  }

  if (repo.findByEmail(email)) {
    return res.status(409).json({ error: "Email já cadastrado" });
  }

  const user = repo.create({ name, email, type, password });
  res.status(201).json(user);
});

// PUT /users/:id — update user
routes.put("/users/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, type, password } = req.body;

  if (email) {
    const existing = repo.findByEmail(email);
    if (existing && existing.id !== id) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }
  }

  const user = repo.update(id, { name, email, type, password });
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(user);
});

// DELETE /users/:id — remove user
routes.delete("/users/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const removed = repo.remove(id);
  if (!removed) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  res.status(204).send();
});

module.exports = routes;
