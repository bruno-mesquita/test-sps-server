import { describe, it, expect, beforeEach } from "vitest";
import { UserRepository } from "../repositories/UserRepository";
import { AttachmentRepository } from "../repositories/attachmentRepository";
import { AttachmentService } from "../services/attachmentService";

const FAKE_FILE = {
  fieldname: "file",
  originalname: "documento.pdf",
  encoding: "7bit",
  mimetype: "application/pdf",
  size: 2048,
  filename: "abc123.pdf",
  path: "uploads/abc123.pdf",
  destination: "uploads",
  buffer: Buffer.from(""),
  stream: null as never,
} satisfies Express.Multer.File;

let attachmentService: AttachmentService;

beforeEach(() => {
  attachmentService = new AttachmentService(new UserRepository(), new AttachmentRepository());
});

describe("AttachmentService.createMany", () => {
  it("cria attachments para usuário existente", async () => {
    const result = await attachmentService.createMany(1, [FAKE_FILE]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].originalName).toBe("documento.pdf");
    expect(result![0].userId).toBe(1);
  });

  it("retorna null para usuário inexistente", async () => {
    const result = await attachmentService.createMany(9999, [FAKE_FILE]);
    expect(result).toBeNull();
  });

  it("cria múltiplos attachments de uma vez", async () => {
    const files = [FAKE_FILE, { ...FAKE_FILE, filename: "xyz.pdf", originalname: "outro.pdf" }];
    const result = await attachmentService.createMany(1, files);
    expect(result).toHaveLength(2);
  });
});

describe("AttachmentService.listByUser", () => {
  it("retorna lista de attachments do usuário", async () => {
    await attachmentService.createMany(1, [FAKE_FILE]);
    const list = await attachmentService.listByUser(1);
    expect(list).toHaveLength(1);
  });

  it("retorna null para usuário inexistente", async () => {
    const list = await attachmentService.listByUser(9999);
    expect(list).toBeNull();
  });

  it("retorna array vazio se usuário não tem attachments", async () => {
    const list = await attachmentService.listByUser(1);
    expect(list).toEqual([]);
  });
});

describe("AttachmentService.remove", () => {
  it("remove attachment existente e retorna ok", async () => {
    const created = await attachmentService.createMany(1, [FAKE_FILE]);
    const id = created![0].id;
    const result = await attachmentService.remove(1, id);
    expect(result).toBe("ok");
  });

  it("retorna not_found para attachment inexistente", async () => {
    const result = await attachmentService.remove(1, 9999);
    expect(result).toBe("not_found");
  });

  it("retorna not_found ao tentar remover attachment de outro usuário", async () => {
    const created = await attachmentService.createMany(1, [FAKE_FILE]);
    const id = created![0].id;
    const result = await attachmentService.remove(2, id);
    expect(result).toBe("not_found");
  });
});
