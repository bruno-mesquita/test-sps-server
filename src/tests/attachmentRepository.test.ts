import { describe, it, expect, beforeEach } from "vitest";
import { AttachmentRepository } from "../repositories/attachmentRepository";

const USER_ID = "user-test-1";
const OTHER_USER_ID = "user-test-2";
const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

let attachmentRepository: AttachmentRepository;

beforeEach(() => {
  attachmentRepository = new AttachmentRepository();
});

const BASE: Parameters<AttachmentRepository["createAttachment"]>[0] = {
  userId: USER_ID,
  filename: "file.pdf",
  originalName: "documento.pdf",
  mimetype: "application/pdf",
  size: 1024,
  url: "http://localhost:3000/uploads/file.pdf",
};

describe("AttachmentRepository.createAttachment", () => {
  it("cria attachment com id UUID e createdAt", async () => {
    const att = await attachmentRepository.createAttachment(BASE);
    expect(typeof att.id).toBe("string");
    expect(att.id.length).toBeGreaterThan(0);
    expect(att.userId).toBe(USER_ID);
    expect(att.createdAt).toBeDefined();
  });

  it("ids únicos a cada criação", async () => {
    const a = await attachmentRepository.createAttachment(BASE);
    const b = await attachmentRepository.createAttachment({ ...BASE, filename: "b.pdf" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("AttachmentRepository.findByUserId", () => {
  it("retorna attachments do usuário", async () => {
    await attachmentRepository.createAttachment(BASE);
    await attachmentRepository.createAttachment({ ...BASE, userId: OTHER_USER_ID, filename: "outro.pdf" });
    const result = await attachmentRepository.findByUserId(USER_ID);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe(USER_ID);
  });

  it("retorna array vazio se usuário não tem attachments", async () => {
    const result = await attachmentRepository.findByUserId(NONEXISTENT_ID);
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
    const found = await attachmentRepository.findById(NONEXISTENT_ID);
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
    const result = await attachmentRepository.removeAttachment(NONEXISTENT_ID);
    expect(result).toBe(false);
  });
});
