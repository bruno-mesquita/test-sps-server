import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import type { UploadedFile } from "express-fileupload";

export interface StoredFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface StorageOptions {
  allowedMimes?: string[];
}

const UPLOADS_DIR = path.resolve("uploads");

export class StorageService {
  async save(file: UploadedFile, options: StorageOptions = {}): Promise<StoredFile> {
    const { allowedMimes } = options;

    if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
      throw new Error(`Mime type "${file.mimetype}" not allowed`);
    }

    const ext = path.extname(file.name) || "";
    const diskName = `${crypto.randomUUID()}${ext}`;
    const destPath = path.join(UPLOADS_DIR, diskName);

    await file.mv(destPath);

    return {
      filename: diskName,
      originalName: file.name,
      mimetype: file.mimetype,
      size: file.size,
      path: path.join("uploads", diskName),
    };
  }

  async saveMany(files: UploadedFile[], options: StorageOptions = {}): Promise<StoredFile[]> {
    return Promise.all(files.map((f) => this.save(f, options)));
  }

  async remove(filePath: string): Promise<void> {
    await fs.unlink(path.resolve(filePath));
  }
}

export const storageService = new StorageService();
