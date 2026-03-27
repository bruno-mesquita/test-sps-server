import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import * as repo from "../repository";

const ADMIN = { email: "admin@spsgroup.com.br", password: "1234" };

async function getToken(credentials = ADMIN): Promise<string> {
  const res = await request(app).post("/auth").send(credentials);
  return res.body.token as string;
}

beforeEach(() => {
  repo.reset();
});

// ---------------------------------------------------------------------------
// POST /auth
// ---------------------------------------------------------------------------
describe("POST /auth", () => {
  it("retorna token com credenciais válidas", async () => {
    const res = await request(app).post("/auth").send(ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("retorna 401 com senha errada", async () => {
    const res = await request(app)
      .post("/auth")
      .send({ email: ADMIN.email, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("retorna 401 com email inexistente", async () => {
    const res = await request(app)
      .post("/auth")
      .send({ email: "nobody@test.com", password: "1234" });
    expect(res.status).toBe(401);
  });

  it("retorna 400 sem campos obrigatórios", async () => {
    const res = await request(app).post("/auth").send({ email: ADMIN.email });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /users
// ---------------------------------------------------------------------------
describe("GET /users", () => {
  it("retorna lista de usuários com token válido", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
  });

  it("retorna 401 com token inválido", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /users
// ---------------------------------------------------------------------------
describe("POST /users", () => {
  const newUser = {
    name: "João",
    email: "joao@test.com",
    type: "user",
    password: "pass123",
  };

  it("cria usuário com dados válidos", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      type: newUser.type,
    });
    expect(res.body).toHaveProperty("id");
  });

  it("retorna 409 para email duplicado", async () => {
    const token = await getToken();
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);
    expect(res.status).toBe(409);
  });

  it("retorna 400 quando falta campo obrigatório", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sem email", type: "user", password: "abc" });
    expect(res.status).toBe(400);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).post("/users").send(newUser);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PUT /users/:id
// ---------------------------------------------------------------------------
describe("PUT /users/:id", () => {
  it("atualiza usuário existente", async () => {
    const token = await getToken();
    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Admin Atualizado" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Admin Atualizado");
    expect(res.body.id).toBe(1);
  });

  it("retorna 404 para id inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .put("/users/9999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ninguém" });
    expect(res.status).toBe(404);
  });

  it("retorna 409 ao trocar email para um já cadastrado", async () => {
    const token = await getToken();
    // cria segundo usuário
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Maria", email: "maria@test.com", type: "user", password: "abc" });

    // tenta atualizar admin com o email da Maria
    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "maria@test.com" });
    expect(res.status).toBe(409);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).put("/users/1").send({ name: "X" });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// DELETE /users/:id
// ---------------------------------------------------------------------------
describe("DELETE /users/:id", () => {
  it("remove usuário existente e retorna 204", async () => {
    const token = await getToken();
    // cria um usuário para deletar
    const created = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Para Deletar", email: "del@test.com", type: "user", password: "abc" });

    const res = await request(app)
      .delete(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("retorna 404 para id inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .delete("/users/9999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/users/1");
    expect(res.status).toBe(401);
  });

  it("usuário deletado não aparece na listagem", async () => {
    const token = await getToken();
    const created = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Efêmero", email: "efe@test.com", type: "user", password: "abc" });

    await request(app)
      .delete(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const list = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    const ids = (list.body as Array<{ id: number }>).map((u) => u.id);
    expect(ids).not.toContain(created.body.id);
  });
});
