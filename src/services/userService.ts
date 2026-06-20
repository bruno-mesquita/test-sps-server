import bcrypt from "bcrypt";
import type { UploadedFile } from "express-fileupload";
import { RepositoryFactory } from "../repositories/factory";
import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "../repositories/interfaces";
import type { IPhotoService } from "./interfaces";
import { storageService } from "./storageService";
import { photoService } from "./photoService";
import { Attachment, User } from "../types";

const PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];

type SafeUser = Omit<User, "password" | "photoId">;
type UserWithPhoto = SafeUser & { originalUrl: string | null; previewUrl: string | null };
type UserWithPhotoAndCount = UserWithPhoto & { attachmentCount: number };
type UserWithPhotoAndAttachments = UserWithPhoto & { attachments: Attachment[] };
type UpdateResult =
  | { ok: true; user: UserWithPhoto }
  | { ok: false; reason: "not_found" | "conflict" };

export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private attachmentRepo: IAttachmentRepository,
    private photoRepo: IPhotoRepository,
    private photoSvc: IPhotoService,
  ) {}

  async withPhoto(user: User): Promise<UserWithPhoto> {
    const photo = user.photoId
      ? await this.photoRepo.findPhotoById(user.photoId)
      : undefined;
    const { password, photoId, ...safe } = user;
    return {
      ...safe,
      originalUrl: photo?.originalUrl ?? null,
      previewUrl: photo?.previewUrl ?? null,
    };
  }

  async list(): Promise<UserWithPhotoAndCount[]> {
    const users = await this.userRepo.findAll();
    return Promise.all(
      users.map(async (u) => {
        const [withPhoto, attachmentCount] = await Promise.all([
          this.withPhoto(u),
          this.attachmentRepo.getCountByUserId(u.id),
        ]);
        return { ...withPhoto, attachmentCount };
      }),
    );
  }

  async getById(id: string): Promise<UserWithPhotoAndAttachments | null> {
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    const [withPhoto, attachments] = await Promise.all([
      this.withPhoto(user),
      this.attachmentRepo.findByUserId(id),
    ]);
    return { ...withPhoto, attachments };
  }

  async create({
    name,
    email,
    type,
    password,
    file,
    attachments,
  }: Omit<User, "id"> & { file?: UploadedFile; attachments?: UploadedFile[] }): Promise<UserWithPhotoAndAttachments | null> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) return null;

    let photoId: string | undefined;
    if (file) {
      const storedFile = await storageService.save(file, { allowedMimes: PHOTO_MIMES });
      const photo = await this.photoSvc.processPhoto(storedFile);
      photoId = photo.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({ name, email, type, password: hashed, photoId });

    const port = process.env.PORT ?? 3000;
    let attachmentRecords: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      const storedFiles = await storageService.saveMany(attachments);
      attachmentRecords = await Promise.all(
        storedFiles.map((f) =>
          this.attachmentRepo.createAttachment({
            userId: user.id,
            filename: f.filename,
            originalName: f.originalName,
            mimetype: f.mimetype,
            size: f.size,
            url: `http://localhost:${port}/uploads/${f.filename}`,
          }),
        ),
      );
    }

    const withPhoto = await this.withPhoto(user);
    return { ...withPhoto, attachments: attachmentRecords };
  }

  async update(
    id: string,
    {
      name,
      email,
      type,
      password,
      file,
    }: Partial<Omit<User, "id">> & { file?: UploadedFile },
  ): Promise<UpdateResult> {
    if (email) {
      const existing = await this.userRepo.findByEmail(email);
      if (existing && existing.id !== id) return { ok: false, reason: "conflict" };
    }

    let photoId: string | undefined;
    if (file) {
      const storedFile = await storageService.save(file, { allowedMimes: PHOTO_MIMES });
      const photo = await this.photoSvc.processPhoto(storedFile);
      photoId = photo.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await this.userRepo.update(id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(type !== undefined && { type }),
      ...(hashedPassword !== undefined && { password: hashedPassword }),
      ...(photoId !== undefined && { photoId }),
    });
    if (!user) return { ok: false, reason: "not_found" };
    return { ok: true, user: await this.withPhoto(user) };
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepo.remove(id);
  }

  async clearPhoto(id: string): Promise<UserWithPhoto | null> {
    const user = await this.userRepo.clearPhoto(id);
    if (!user) return null;
    return this.withPhoto(user);
  }
}

export const userService = new UserService(
  RepositoryFactory.createUserRepository(),
  RepositoryFactory.createAttachmentRepository(),
  RepositoryFactory.createPhotoRepository(),
  photoService,
);
