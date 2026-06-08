import "dotenv/config";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../repositories/UserRepository";
import { AttachmentRepository } from "../repositories/attachmentRepository";
import { UserService } from "../services/userService";
import type { IPhotoRepository } from "../repositories/interfaces";
import type { IPhotoService } from "../services/interfaces";

const mockPhotoRepo: IPhotoRepository = {
  createPhoto: vi.fn(),
  findPhotoById: vi.fn().mockResolvedValue(undefined),
};

const mockPhotoService: IPhotoService = {
  processPhoto: vi.fn().mockResolvedValue({
    id: 99,
    filename: "img.jpg",
    originalUrl: "http://localhost/uploads/original.jpg",
    previewUrl: "http://localhost/uploads/preview.jpg",
  }),
};

let userRepo: UserRepository;
let userService: UserService;

beforeEach(() => {
  userRepo = new UserRepository();
  userService = new UserService(userRepo, new AttachmentRepository(), mockPhotoRepo, mockPhotoService);
});

describe("UserService.list", () => {
  it("retorna usuários sem password e photoId", async () => {
    const users = await userService.list();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0]).not.toHaveProperty("password");
    expect(users[0]).not.toHaveProperty("photoId");
  });

  it("retorna campos originalUrl e previewUrl", async () => {
    const users = await userService.list();
    expect(users[0]).toHaveProperty("originalUrl");
    expect(users[0]).toHaveProperty("previewUrl");
  });
});

describe("UserService.getById", () => {
  it("retorna usuário sem password para id existente", async () => {
    const user = await userService.getById(1);
    expect(user).not.toBeNull();
    expect(user).not.toHaveProperty("password");
    expect(user?.id).toBe(1);
  });

  it("retorna null para id inexistente", async () => {
    const user = await userService.getById(9999);
    expect(user).toBeNull();
  });
});

describe("UserService.create", () => {
  it("cria usuário e retorna objeto sem password", async () => {
    const user = await userService.create({
      name: "João",
      email: "joao@test.com",
      type: "user",
      password: "pass123",
    });
    expect(user).not.toBeNull();
    expect(user).not.toHaveProperty("password");
    expect(user?.email).toBe("joao@test.com");
  });

  it("hash a senha (não armazena plain text)", async () => {
    await userService.create({ name: "X", email: "x@test.com", type: "user", password: "secret" });
    const raw = await userRepo.findByEmail("x@test.com");
    expect(raw?.password).not.toBe("secret");
    expect(raw?.password).toMatch(/^\$2[aby]\$/);
  });

  it("retorna null para email duplicado", async () => {
    await userService.create({ name: "A", email: "dup@test.com", type: "user", password: "x" });
    const result = await userService.create({ name: "B", email: "dup@test.com", type: "user", password: "y" });
    expect(result).toBeNull();
  });
});

describe("UserService.update", () => {
  it("atualiza nome e retorna usuário sem password", async () => {
    const result = await userService.update(1, { name: "Admin Atualizado" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.name).toBe("Admin Atualizado");
    expect(result.user).not.toHaveProperty("password");
  });

  it("retorna not_found para id inexistente", async () => {
    const result = await userService.update(9999, { name: "X" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("not_found");
  });

  it("retorna conflict ao tentar email já em uso por outro usuário", async () => {
    await userService.create({ name: "Maria", email: "maria@test.com", type: "user", password: "x" });
    const result = await userService.update(1, { email: "maria@test.com" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("conflict");
  });

  it("permite atualizar email para o próprio email do usuário", async () => {
    const result = await userService.update(1, { email: "admin@spsgroup.com.br" });
    expect(result.ok).toBe(true);
  });
});

describe("UserService.delete", () => {
  it("remove usuário existente e retorna true", async () => {
    const result = await userService.delete(1);
    expect(result).toBe(true);
  });

  it("retorna false para id inexistente", async () => {
    const result = await userService.delete(9999);
    expect(result).toBe(false);
  });
});
