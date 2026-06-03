import { describe, it, expect, beforeEach } from "vitest";
import { userRepository } from "../repositories/UserRepository";

beforeEach(async () => {
  await userRepository.reset();
});

describe("UserRepository.findAll", () => {
  it("retorna usuário seed por padrão", async () => {
    const users = await userRepository.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("admin@spsgroup.com.br");
  });
});

describe("UserRepository.findByEmail", () => {
  it("retorna usuário com email existente", async () => {
    const user = await userRepository.findByEmail("admin@spsgroup.com.br");
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
  });

  it("retorna undefined para email inexistente", async () => {
    const user = await userRepository.findByEmail("x@x.com");
    expect(user).toBeUndefined();
  });
});

describe("UserRepository.findById", () => {
  it("retorna usuário com id existente", async () => {
    const user = await userRepository.findById(1);
    expect(user).toBeDefined();
    expect(user?.name).toBe("admin");
  });

  it("retorna undefined para id inexistente", async () => {
    const user = await userRepository.findById(9999);
    expect(user).toBeUndefined();
  });
});

describe("UserRepository.create", () => {
  it("cria usuário com id incrementado", async () => {
    const user = await userRepository.create({
      name: "Maria",
      email: "maria@test.com",
      type: "user",
      password: "hashed",
    });
    expect(user.id).toBe(2);
    expect(user.email).toBe("maria@test.com");
  });

  it("ids incrementam a cada criação", async () => {
    const a = await userRepository.create({ name: "A", email: "a@test.com", type: "user", password: "x" });
    const b = await userRepository.create({ name: "B", email: "b@test.com", type: "user", password: "x" });
    expect(b.id).toBe(a.id + 1);
  });

  it("usuário criado aparece em findAll", async () => {
    await userRepository.create({ name: "X", email: "x@test.com", type: "user", password: "x" });
    const all = await userRepository.findAll();
    expect(all).toHaveLength(2);
  });
});

describe("UserRepository.update", () => {
  it("atualiza campos do usuário", async () => {
    const updated = await userRepository.update(1, { name: "Admin Novo" });
    expect(updated?.name).toBe("Admin Novo");
    expect(updated?.id).toBe(1);
  });

  it("retorna null para id inexistente", async () => {
    const result = await userRepository.update(9999, { name: "X" });
    expect(result).toBeNull();
  });

  it("não altera campos não informados", async () => {
    await userRepository.update(1, { name: "Novo" });
    const user = await userRepository.findById(1);
    expect(user?.email).toBe("admin@spsgroup.com.br");
  });
});

describe("UserRepository.remove", () => {
  it("remove usuário existente e retorna true", async () => {
    const result = await userRepository.remove(1);
    expect(result).toBe(true);
    expect(await userRepository.findById(1)).toBeUndefined();
  });

  it("retorna false para id inexistente", async () => {
    const result = await userRepository.remove(9999);
    expect(result).toBe(false);
  });
});

describe("UserRepository.clearPhoto", () => {
  it("remove photoId do usuário", async () => {
    await userRepository.update(1, { photoId: 42 });
    const user = await userRepository.clearPhoto(1);
    expect(user?.photoId).toBeUndefined();
  });

  it("retorna null para id inexistente", async () => {
    const result = await userRepository.clearPhoto(9999);
    expect(result).toBeNull();
  });
});

describe("UserRepository.reset", () => {
  it("volta ao estado seed após mutações", async () => {
    await userRepository.create({ name: "X", email: "x@test.com", type: "user", password: "x" });
    await userRepository.reset();
    const all = await userRepository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(1);
  });

  it("nextId reinicia em 2 após reset", async () => {
    await userRepository.create({ name: "X", email: "x@test.com", type: "user", password: "x" });
    await userRepository.reset();
    const user = await userRepository.create({ name: "Y", email: "y@test.com", type: "user", password: "x" });
    expect(user.id).toBe(2);
  });
});
