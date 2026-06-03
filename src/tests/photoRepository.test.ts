import { describe, it, expect, beforeEach } from "vitest";
import { photoRepository } from "../repositories/photoRepository";

beforeEach(() => {
  photoRepository.reset();
});

describe("PhotoRepository.createPhoto", () => {
  it("cria foto com id autoincremental", async () => {
    const photo = await photoRepository.createPhoto({
      filename: "img.jpg",
      originalUrl: "http://localhost/uploads/original.jpg",
      previewUrl: "http://localhost/uploads/preview.jpg",
    });
    expect(photo.id).toBe(1);
    expect(photo.filename).toBe("img.jpg");
  });

  it("ids incrementam a cada criação", async () => {
    const a = await photoRepository.createPhoto({ filename: "a.jpg", originalUrl: "", previewUrl: "" });
    const b = await photoRepository.createPhoto({ filename: "b.jpg", originalUrl: "", previewUrl: "" });
    expect(b.id).toBe(a.id + 1);
  });
});

describe("PhotoRepository.findPhotoById", () => {
  it("retorna foto existente", async () => {
    const created = await photoRepository.createPhoto({ filename: "x.jpg", originalUrl: "o", previewUrl: "p" });
    const found = await photoRepository.findPhotoById(created.id);
    expect(found?.filename).toBe("x.jpg");
  });

  it("retorna undefined para id inexistente", async () => {
    const found = await photoRepository.findPhotoById(9999);
    expect(found).toBeUndefined();
  });
});
