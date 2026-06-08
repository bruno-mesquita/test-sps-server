import { describe, it, expect, beforeEach } from "vitest";
import { photoRepository } from "../repositories/photoRepository";

const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

beforeEach(() => {
  photoRepository.reset();
});

describe("PhotoRepository.createPhoto", () => {
  it("cria foto com id UUID", async () => {
    const photo = await photoRepository.createPhoto({
      filename: "img.jpg",
      originalUrl: "http://localhost/uploads/original.jpg",
      previewUrl: "http://localhost/uploads/preview.jpg",
    });
    expect(typeof photo.id).toBe("string");
    expect(photo.id.length).toBeGreaterThan(0);
    expect(photo.filename).toBe("img.jpg");
  });

  it("ids únicos a cada criação", async () => {
    const a = await photoRepository.createPhoto({ filename: "a.jpg", originalUrl: "", previewUrl: "" });
    const b = await photoRepository.createPhoto({ filename: "b.jpg", originalUrl: "", previewUrl: "" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("PhotoRepository.findPhotoById", () => {
  it("retorna foto existente", async () => {
    const created = await photoRepository.createPhoto({ filename: "x.jpg", originalUrl: "o", previewUrl: "p" });
    const found = await photoRepository.findPhotoById(created.id);
    expect(found?.filename).toBe("x.jpg");
  });

  it("retorna undefined para id inexistente", async () => {
    const found = await photoRepository.findPhotoById(NONEXISTENT_ID);
    expect(found).toBeUndefined();
  });
});
