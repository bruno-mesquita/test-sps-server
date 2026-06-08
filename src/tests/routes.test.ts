import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import * as repo from "../repositories/UserRepository";
import * as attachmentRepo from "../repositories/attachmentRepository";

const ADMIN = { email: "admin@spsgroup.com.br", password: "1234" };

async function getToken(credentials = ADMIN): Promise<string> {
  const res = await request(app).post("/auth").send(credentials);
  return res.body.token as string;
}

beforeEach(() => {
  repo.userRepository.reset();
  attachmentRepo.attachmentRepository.reset();
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
// GET /users/:id
// ---------------------------------------------------------------------------
describe("GET /users/:id", () => {
  it("retorna usuário pelo id com token válido", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/users/1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, email: "admin@spsgroup.com.br" });
    expect(res.body).not.toHaveProperty("password");
  });

  it("retorna 404 para id inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/users/9999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).get("/users/1");
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

// ---------------------------------------------------------------------------
// DELETE /users/:id/photo
// ---------------------------------------------------------------------------
describe("DELETE /users/:id/photo", () => {
  it("limpa foto do usuário e retorna 200", async () => {
    const token = await getToken();
    const res = await request(app)
      .delete("/users/1/photo")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1 });
    expect(res.body.photoId).toBeUndefined();
  });

  it("retorna 404 para id inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .delete("/users/9999/photo")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/users/1/photo");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para usuário não-admin", async () => {
    const token = await getToken();
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Comum", email: "comum@test.com", type: "user", password: "abc" });

    const userToken = await getToken({ email: "comum@test.com", password: "abc" });
    const res = await request(app)
      .delete("/users/1/photo")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// POST /users/:id/attachments
// ---------------------------------------------------------------------------
describe("POST /users/:id/attachments", () => {
  it("faz upload de anexo e retorna 201", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/users/1/attachments")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("conteudo do arquivo"), "arquivo.txt");
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("userId", 1);
  });

  it("retorna 400 sem arquivos", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/users/1/attachments")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("retorna 404 para usuário inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/users/9999/attachments")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("x"), "x.txt");
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app)
      .post("/users/1/attachments")
      .attach("files", Buffer.from("x"), "x.txt");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para usuário acessando outro usuário", async () => {
    const token = await getToken();
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Outro", email: "outro@test.com", type: "user", password: "abc" });

    const userToken = await getToken({ email: "outro@test.com", password: "abc" });
    const res = await request(app)
      .post("/users/1/attachments")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", Buffer.from("x"), "x.txt");
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /users/:id/attachments
// ---------------------------------------------------------------------------
describe("GET /users/:id/attachments", () => {
  it("retorna lista de anexos do usuário", async () => {
    const token = await getToken();
    await request(app)
      .post("/users/1/attachments")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("conteudo"), "doc.txt");

    const res = await request(app)
      .get("/users/1/attachments")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("retorna lista vazia para usuário sem anexos", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/users/1/attachments")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).get("/users/1/attachments");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para usuário acessando outro usuário", async () => {
    const token = await getToken();
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Outro2", email: "outro2@test.com", type: "user", password: "abc" });

    const userToken = await getToken({ email: "outro2@test.com", password: "abc" });
    const res = await request(app)
      .get("/users/1/attachments")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// DELETE /users/:id/attachments/:attachmentId
// ---------------------------------------------------------------------------
describe("DELETE /users/:id/attachments/:attachmentId", () => {
  async function createAttachment(token: string, userId = 1): Promise<number> {
    const res = await request(app)
      .post(`/users/${userId}/attachments`)
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("conteudo"), "arq.txt");
    return (res.body as Array<{ id: number }>)[0].id;
  }

  it("remove anexo e retorna 204", async () => {
    const token = await getToken();
    const attachmentId = await createAttachment(token);
    const res = await request(app)
      .delete(`/users/1/attachments/${attachmentId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("retorna 404 para anexo inexistente", async () => {
    const token = await getToken();
    const res = await request(app)
      .delete("/users/1/attachments/9999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/users/1/attachments/1");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para usuário acessando outro usuário", async () => {
    const token = await getToken();
    const attachmentId = await createAttachment(token);

    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Outro3", email: "outro3@test.com", type: "user", password: "abc" });

    const userToken = await getToken({ email: "outro3@test.com", password: "abc" });
    const res = await request(app)
      .delete(`/users/1/attachments/${attachmentId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
