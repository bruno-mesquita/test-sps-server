import type { Attachment, Photo, User } from "../types";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
  create(data: Omit<User, "id">): Promise<User>;
  update(id: number, data: Partial<Omit<User, "id">>): Promise<User | null>;
  clearPhoto(id: number): Promise<User | null>;
  remove(id: number): Promise<boolean>;
}

export interface IAttachmentRepository {
  createAttachment(data: Omit<Attachment, "id" | "createdAt">): Promise<Attachment>;
  findByUserId(userId: number): Promise<Attachment[]>;
  findById(id: number): Promise<Attachment | undefined>;
  getCountByUserId(userId: number): Promise<number>;
  removeAttachment(id: number): Promise<boolean>;
}

export interface IPhotoRepository {
  createPhoto(data: Omit<Photo, "id">): Promise<Photo>;
  findPhotoById(id: number): Promise<Photo | undefined>;
}
