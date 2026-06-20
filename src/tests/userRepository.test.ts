import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "../repositories/InMemory/InMemoryUserRepository";

const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

let userRepository: InMemoryUserRepository;

beforeEach(async () => {
  userRepository = new InMemoryUserRepository();
});

async function adminId() {
  const admin = await userRepository.findByEmail("admin@spsgroup.com.br");
  return admin!.id;
}

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
    expect(typeof user?.id).toBe("string");
  });

  it("retorna undefined para email inexistente", async () => {
    const user = await userRepository.findByEmail("x@x.com");
    expect(user).toBeUndefined();
  });
});

describe("UserRepository.findById", () => {
  it("retorna usuário com id existente", async () => {
    const id = await adminId();
    const user = await userRepository.findById(id);
    expect(user).toBeDefined();
    expect(user?.name).toBe("admin");
  });

  it("retorna undefined para id inexistente", async () => {
    const user = await userRepository.findById(NONEXISTENT_ID);
    expect(user).toBeUndefined();
  });
});

describe("UserRepository.create", () => {
  it("cria usuário com id UUID", async () => {
    const user = await userRepository.create({
      name: "Maria",
      email: "maria@test.com",
      type: "user",
      password: "hashed",
    });
    expect(typeof user.id).toBe("string");
    expect(user.id.length).toBeGreaterThan(0);
    expect(user.email).toBe("maria@test.com");
  });

  it("ids únicos a cada criação", async () => {
    const a = await userRepository.create({ name: "A", email: "a@test.com", type: "user", password: "x" });
    const b = await userRepository.create({ name: "B", email: "b@test.com", type: "user", password: "x" });
    expect(a.id).not.toBe(b.id);
  });

  it("usuário criado aparece em findAll", async () => {
    await userRepository.create({ name: "X", email: "x@test.com", type: "user", password: "x" });
    const all = await userRepository.findAll();
    expect(all).toHaveLength(2);
  });
});

describe("UserRepository.update", () => {
  it("atualiza campos do usuário", async () => {
    const id = await adminId();
    const updated = await userRepository.update(id, { name: "Admin Novo" });
    expect(updated?.name).toBe("Admin Novo");
    expect(updated?.id).toBe(id);
  });

  it("retorna null para id inexistente", async () => {
    const result = await userRepository.update(NONEXISTENT_ID, { name: "X" });
    expect(result).toBeNull();
  });

  it("não altera campos não informados", async () => {
    const id = await adminId();
    await userRepository.update(id, { name: "Novo" });
    const user = await userRepository.findById(id);
    expect(user?.email).toBe("admin@spsgroup.com.br");
  });
});

describe("UserRepository.remove", () => {
  it("remove usuário existente e retorna true", async () => {
    const id = await adminId();
    const result = await userRepository.remove(id);
    expect(result).toBe(true);
    expect(await userRepository.findById(id)).toBeUndefined();
  });

  it("retorna false para id inexistente", async () => {
    const result = await userRepository.remove(NONEXISTENT_ID);
    expect(result).toBe(false);
  });
});

describe("UserRepository.clearPhoto", () => {
  it("remove photoId do usuário", async () => {
    const id = await adminId();
    await userRepository.update(id, { photoId: "photo-uuid-42" });
    const user = await userRepository.clearPhoto(id);
    expect(user?.photoId).toBeUndefined();
  });

  it("retorna null para id inexistente", async () => {
    const result = await userRepository.clearPhoto(NONEXISTENT_ID);
    expect(result).toBeNull();
  });
});

describe("UserRepository.reset", () => {
  it("volta ao estado seed após mutações", async () => {
    await userRepository.create({ name: "X", email: "x@test.com", type: "user", password: "x" });
    await userRepository.reset();
    const all = await userRepository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].email).toBe("admin@spsgroup.com.br");
  });

  it("id do seed é string após reset", async () => {
    await userRepository.reset();
    const all = await userRepository.findAll();
    expect(typeof all[0].id).toBe("string");
  });
});
