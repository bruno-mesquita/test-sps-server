import bcrypt from "bcrypt";
import { photoRepository } from "../repositories/photoRepository";
import { userRepository } from "../repositories/UserRepository";
import { User } from "../types";
import { photoService } from "./photoService";

type SafeUser = Omit<User, "password" | "photoId">;
type UserWithPhoto = SafeUser & { originalUrl: string | null; previewUrl: string | null };
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

  async list(): Promise<UserWithPhoto[]> {
    const users = await userRepository.findAll();
    return Promise.all(users.map((u) => this.withPhoto(u)));
  }

  async getById(id: number): Promise<UserWithPhoto | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;
    return this.withPhoto(user);
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
