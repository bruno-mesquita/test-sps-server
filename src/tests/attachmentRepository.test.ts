import { describe, it, expect, beforeEach } from "vitest";
import { attachmentRepository } from "../repositories/attachmentRepository";

const BASE: Parameters<typeof attachmentRepository.createAttachment>[0] = {
  userId: 1,
  filename: "file.pdf",
  originalName: "documento.pdf",
  mimetype: "application/pdf",
  size: 1024,
  url: "http://localhost:3000/uploads/file.pdf",
};

beforeEach(() => {
  attachmentRepository.reset();
});

describe("AttachmentRepository.createAttachment", () => {
  it("cria attachment com id e createdAt", async () => {
    const att = await attachmentRepository.createAttachment(BASE);
    expect(att.id).toBe(1);
    expect(att.userId).toBe(1);
    expect(att.createdAt).toBeDefined();
  });

  it("ids incrementam a cada criação", async () => {
    const a = await attachmentRepository.createAttachment(BASE);
    const b = await attachmentRepository.createAttachment({ ...BASE, filename: "b.pdf" });
    expect(b.id).toBe(a.id + 1);
  });
});

describe("AttachmentRepository.findByUserId", () => {
  it("retorna attachments do usuário", async () => {
    await attachmentRepository.createAttachment(BASE);
    await attachmentRepository.createAttachment({ ...BASE, userId: 2, filename: "outro.pdf" });
    const result = await attachmentRepository.findByUserId(1);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe(1);
  });

  it("retorna array vazio se usuário não tem attachments", async () => {
    const result = await attachmentRepository.findByUserId(99);
    expect(result).toEqual([]);
  });
});

describe("AttachmentRepository.findById", () => {
  it("retorna attachment pelo id", async () => {
    const att = await attachmentRepository.createAttachment(BASE);
    const found = await attachmentRepository.findById(att.id);
    expect(found?.filename).toBe("file.pdf");
  });

  it("retorna undefined para id inexistente", async () => {
    const found = await attachmentRepository.findById(9999);
    expect(found).toBeUndefined();
  });
});

describe("AttachmentRepository.removeAttachment", () => {
  it("remove attachment existente e retorna true", async () => {
    const att = await attachmentRepository.createAttachment(BASE);
    const result = await attachmentRepository.removeAttachment(att.id);
    expect(result).toBe(true);
    expect(await attachmentRepository.findById(att.id)).toBeUndefined();
  });

  it("retorna false para id inexistente", async () => {
    const result = await attachmentRepository.removeAttachment(9999);
    expect(result).toBe(false);
  });
});
