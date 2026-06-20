import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "./interfaces";
import { UserRepository, userRepository } from "./UserRepository";
import { AttachmentRepository, attachmentRepository } from "./attachmentRepository";
import { PhotoRepository, photoRepository } from "./photoRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { MongoAttachmentRepository } from "./mongo/MongoAttachmentRepository";
import { MongoPhotoRepository } from "./mongo/MongoPhotoRepository";

export class RepositoryFactory {
  private constructor() {}

  static createUserRepository(): IUserRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoUserRepository();
    return userRepository;
  }

  static createAttachmentRepository(): IAttachmentRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoAttachmentRepository();
    return attachmentRepository;
  }

  static createPhotoRepository(): IPhotoRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoPhotoRepository();
    return photoRepository;
  }

}

