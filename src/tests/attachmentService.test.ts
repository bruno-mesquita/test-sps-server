import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "../repositories/InMemory/InMemoryUserRepository";
import { InMemoryAttachmentRepository } from "../repositories/InMemory/InMemoryAttachmentRepository";
import { AttachmentService } from "../services/attachmentService";
import type { StoredFile } from "../services/storageService";

const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000002";

const FAKE_FILE: StoredFile = {
  filename: "abc123.pdf",
  originalName: "documento.pdf",
  mimetype: "application/pdf",
  size: 2048,
  path: "uploads/abc123.pdf",
};

let attachmentService: AttachmentService;
let adminId: string;

beforeEach(async () => {
  const userRepo = new InMemoryUserRepository();
  const admin = await userRepo.findByEmail("admin@spsgroup.com.br");
  adminId = admin!.id;
  attachmentService = new AttachmentService(userRepo, new InMemoryAttachmentRepository());
});

describe("AttachmentService.createMany", () => {
  it("cria attachments para usuário existente", async () => {
    const result = await attachmentService.createMany(adminId, [FAKE_FILE]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].originalName).toBe("documento.pdf");
    expect(result![0].userId).toBe(adminId);
  });

  it("retorna null para usuário inexistente", async () => {
    const result = await attachmentService.createMany(NONEXISTENT_ID, [FAKE_FILE]);
    expect(result).toBeNull();
  });

  it("cria múltiplos attachments de uma vez", async () => {
    const files = [FAKE_FILE, { ...FAKE_FILE, filename: "xyz.pdf", originalName: "outro.pdf" }];
    const result = await attachmentService.createMany(adminId, files);
    expect(result).toHaveLength(2);
  });
});

describe("AttachmentService.listByUser", () => {
  it("retorna lista de attachments do usuário", async () => {
    await attachmentService.createMany(adminId, [FAKE_FILE]);
    const list = await attachmentService.listByUser(adminId);
    expect(list).toHaveLength(1);
  });

  it("retorna null para usuário inexistente", async () => {
    const list = await attachmentService.listByUser(NONEXISTENT_ID);
    expect(list).toBeNull();
  });

  it("retorna array vazio se usuário não tem attachments", async () => {
    const list = await attachmentService.listByUser(adminId);
    expect(list).toEqual([]);
  });
});

describe("AttachmentService.remove", () => {
  it("remove attachment existente e retorna ok", async () => {
    const created = await attachmentService.createMany(adminId, [FAKE_FILE]);
    const id = created![0].id;
    const result = await attachmentService.remove(adminId, id);
    expect(result).toBe("ok");
  });

  it("retorna not_found para attachment inexistente", async () => {
    const result = await attachmentService.remove(adminId, NONEXISTENT_ID);
    expect(result).toBe("not_found");
  });

  it("retorna not_found ao tentar remover attachment de outro usuário", async () => {
    const created = await attachmentService.createMany(adminId, [FAKE_FILE]);
    const id = created![0].id;
    const result = await attachmentService.remove(OTHER_USER_ID, id);
    expect(result).toBe("not_found");
  });
});
