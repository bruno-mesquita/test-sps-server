import type { Attachment, Photo, User } from "../types";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(data: Omit<User, "id">): Promise<User>;
  update(id: string, data: Partial<Omit<User, "id">>): Promise<User | null>;
  clearPhoto(id: string): Promise<User | null>;
  remove(id: string): Promise<boolean>;
}

export interface IAttachmentRepository {
  createAttachment(data: Omit<Attachment, "id" | "createdAt">): Promise<Attachment>;
  findByUserId(userId: string): Promise<Attachment[]>;
  findById(id: string): Promise<Attachment | undefined>;
  getCountByUserId(userId: string): Promise<number>;
  removeAttachment(id: string): Promise<boolean>;
}

export interface IPhotoRepository {
  createPhoto(data: Omit<Photo, "id">): Promise<Photo>;
  findPhotoById(id: string): Promise<Photo | undefined>;
}
