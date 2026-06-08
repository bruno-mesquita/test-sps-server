import bcrypt from "bcrypt";
import { attachmentRepository } from "../repositories/attachmentRepository";
import { photoRepository } from "../repositories/photoRepository";
import { userRepository } from "../repositories/UserRepository";
import { Attachment, User } from "../types";
import { photoService } from "./photoService";

type SafeUser = Omit<User, "password" | "photoId">;
type UserWithPhoto = SafeUser & { originalUrl: string | null; previewUrl: string | null };
type UserWithPhotoAndCount = UserWithPhoto & { attachmentCount: number };
type UserWithPhotoAndAttachments = UserWithPhoto & { attachments: Attachment[] };
type UpdateResult =
  | { ok: true; user: UserWithPhoto }
  | { ok: false; reason: "not_found" | "conflict" };

export class UserService {
  async withPhoto(user: User): Promise<UserWithPhoto> {
    const photo = user.photoId
      ? await photoRepository.findPhotoById(user.photoId)
      : undefined;
    const { password, photoId, ...safe } = user;
    return {
      ...safe,
      originalUrl: photo?.originalUrl ?? null,
      previewUrl: photo?.previewUrl ?? null,
    };
  }

  async list(): Promise<UserWithPhotoAndCount[]> {
    const users = await userRepository.findAll();
    return Promise.all(
      users.map(async (u) => {
        const [withPhoto, attachmentCount] = await Promise.all([
          this.withPhoto(u),
          attachmentRepository.getCountByUserId(u.id),
        ]);
        return { ...withPhoto, attachmentCount };
      }),
    );
  }

  async getById(id: number): Promise<UserWithPhotoAndAttachments | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;
    const [withPhoto, attachments] = await Promise.all([
      this.withPhoto(user),
      attachmentRepository.findByUserId(id),
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
    const existing = await userRepository.findByEmail(email);
    if (existing) return null;

    let photoId: number | undefined;
    if (file) {
      const photo = await photoService.processPhoto(file);
      photoId = photo.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, type, password: hashed, photoId });
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
      const existing = await userRepository.findByEmail(email);
      if (existing && existing.id !== id) return { ok: false, reason: "conflict" };
    }

    let photoId: number | undefined;
    if (file) {
      const photo = await photoService.processPhoto(file);
      photoId = photo.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await userRepository.update(id, {
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
    return userRepository.remove(id);
  }

  async clearPhoto(id: number): Promise<UserWithPhoto | null> {
    const user = await userRepository.clearPhoto(id);
    if (!user) return null;
    return this.withPhoto(user);
  }
}

export const userService = new UserService();
