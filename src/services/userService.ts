import bcrypt from "bcrypt";
import { userRepository } from "../repositories/UserRepository";
import { attachmentRepository } from "../repositories/attachmentRepository";
import { photoRepository } from "../repositories/photoRepository";
import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "../repositories/interfaces";
import type { IPhotoService } from "./interfaces";
import { photoService } from "./photoService";
import { Attachment, User } from "../types";

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

  async getById(id: number): Promise<UserWithPhotoAndAttachments | null> {
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
  }: Omit<User, "id"> & { file?: Express.Multer.File }): Promise<SafeUser | null> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) return null;

    let photoId: number | undefined;
    if (file) {
      const photo = await this.photoSvc.processPhoto(file);
      photoId = photo.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({ name, email, type, password: hashed, photoId });
    const { password: _pw, photoId: _pid, ...safe } = user;
    return safe;
  }

  async update(
    id: number,
    {
      name,
      email,
      type,
      password,
      file,
    }: Partial<Omit<User, "id">> & { file?: Express.Multer.File },
  ): Promise<UpdateResult> {
    if (email) {
      const existing = await this.userRepo.findByEmail(email);
      if (existing && existing.id !== id) return { ok: false, reason: "conflict" };
    }

    let photoId: number | undefined;
    if (file) {
      const photo = await this.photoSvc.processPhoto(file);
      photoId = photo.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await this.userRepo.update(id, {
      name,
      email,
      type,
      ...(hashedPassword !== undefined && { password: hashedPassword }),
      ...(photoId !== undefined && { photoId }),
    });
    if (!user) return { ok: false, reason: "not_found" };
    return { ok: true, user: await this.withPhoto(user) };
  }

  async delete(id: number): Promise<boolean> {
    return this.userRepo.remove(id);
  }

  async clearPhoto(id: number): Promise<UserWithPhoto | null> {
    const user = await this.userRepo.clearPhoto(id);
    if (!user) return null;
    return this.withPhoto(user);
  }
}

export const userService = new UserService(
  userRepository,
  attachmentRepository,
  photoRepository,
  photoService,
);
