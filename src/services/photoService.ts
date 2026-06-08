import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { photoRepository } from "../repositories/photoRepository";
import type { IPhotoRepository } from "../repositories/interfaces";
import type { IPhotoService } from "./interfaces";
import type { StoredFile } from "./storageService";
import type { Photo } from "../types";

export class PhotoService implements IPhotoService {
  constructor(private photoRepo: IPhotoRepository) {}

  async processPhoto(file: StoredFile): Promise<Photo> {
    const ext = path.extname(file.filename);
    const base = path.basename(file.filename, ext);

    const originalName = `original-${base}.jpg`;
    const previewName = `preview-${base}.jpg`;

    const originalPath = path.join("uploads", originalName);
    const previewPath = path.join("uploads", previewName);

    await fs.rename(file.path, originalPath);

    await sharp(originalPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toFile(previewPath);

    const baseUrl =
      process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

    return this.photoRepo.createPhoto({
      filename: file.originalName,
      originalUrl: `${baseUrl}/uploads/${originalName}`,
      previewUrl: `${baseUrl}/uploads/${previewName}`,
    });
  }
}

export const photoService = new PhotoService(photoRepository);
