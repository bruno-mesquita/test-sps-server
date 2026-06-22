import bcrypt from "bcrypt";
import path from "path";
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
  | { ok: true; user: UserWithPhotoAndAttachments }
  | { ok: false; reason: "not_found" | "conflict" };

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private attachmentRepository: IAttachmentRepository,
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
    const users = await this.userRepository.findAll();
    const data = await Promise.all(
      users.map(async (u) => {
        const [withPhoto, attachmentCount] = await Promise.all([
          this.withPhoto(u),
          this.attachmentRepository.getCountByUserId(u.id),
        ]);
        return { ...withPhoto, attachmentCount };
      }),
    );

    return data;
  }

  async getById(id: string): Promise<UserWithPhotoAndAttachments | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    const [withPhoto, attachments] = await Promise.all([
      this.withPhoto(user),
      this.attachmentRepository.findByUserId(id),
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
    const existing = await this.userRepository.findByEmail(email);
    if (existing) return null;

    let photoId: string | undefined;
    if (file) {
      const storedFile = await storageService.save(file, { allowedMimes: PHOTO_MIMES });
      const photo = await this.photoSvc.processPhoto(storedFile);
      photoId = photo.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ name, email, type, password: hashed, photoId });

    const port = process.env.PORT ?? 3000;
    let attachmentRecords: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      const storedFiles = await storageService.saveMany(attachments);
      attachmentRecords = await Promise.all(
        storedFiles.map((f) =>
          this.attachmentRepository.createAttachment({
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
      attachments,
      removeAttachmentIds,
    }: Partial<Omit<User, "id">> & { file?: UploadedFile; attachments?: UploadedFile[]; removeAttachmentIds?: string[] },
  ): Promise<UpdateResult> {
    if (email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== id) return { ok: false, reason: "conflict" };
    }

    if (removeAttachmentIds && removeAttachmentIds.length > 0) {
      for (const attachmentId of removeAttachmentIds) {
        const attachment = await this.attachmentRepository.findById(attachmentId);
        if (attachment && attachment.userId === id) {
          await storageService.remove(`uploads/${attachment.filename}`);
          await this.attachmentRepository.removeAttachment(attachmentId);
        }
      }
    }

    let photoId: string | undefined;
    if (file) {
      const storedFile = await storageService.save(file, { allowedMimes: PHOTO_MIMES });
      const photo = await this.photoSvc.processPhoto(storedFile);
      photoId = photo.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await this.userRepository.update(id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(type !== undefined && { type }),
      ...(hashedPassword !== undefined && { password: hashedPassword }),
      ...(photoId !== undefined && { photoId }),
    });
    if (!user) return { ok: false, reason: "not_found" };

    const port = process.env.PORT ?? 3000;
    if (attachments && attachments.length > 0) {
      const storedFiles = await storageService.saveMany(attachments);
      await Promise.all(
        storedFiles.map((f) =>
          this.attachmentRepository.createAttachment({
            userId: id,
            filename: f.filename,
            originalName: f.originalName,
            mimetype: f.mimetype,
            size: f.size,
            url: `http://localhost:${port}/uploads/${f.filename}`,
          }),
        ),
      );
    }

    const [withPhoto, attachmentRecords] = await Promise.all([
      this.withPhoto(user),
      this.attachmentRepository.findByUserId(id),
    ]);
    return { ok: true, user: { ...withPhoto, attachments: attachmentRecords } };
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.remove(id);
  }

  async clearPhoto(id: string): Promise<UserWithPhoto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    if (user.photoId) {
      const photo = await this.photoRepo.findPhotoById(user.photoId);
      if (photo) {
        const originalName = path.basename(photo.originalUrl);
        const previewName = path.basename(photo.previewUrl);
        await storageService.remove(`uploads/${originalName}`);
        await storageService.remove(`uploads/${previewName}`);
      }
    }

    await this.userRepository.clearPhoto(id);
    return this.withPhoto(user);
  }
}

export const userService = new UserService(
  RepositoryFactory.createUserRepository(),
  RepositoryFactory.createAttachmentRepository(),
  RepositoryFactory.createPhotoRepository(),
  photoService,
);
