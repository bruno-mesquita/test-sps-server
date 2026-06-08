import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "./interfaces";
import { UserRepository } from "./UserRepository";
import { AttachmentRepository } from "./attachmentRepository";
import { PhotoRepository } from "./photoRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { MongoAttachmentRepository } from "./mongo/MongoAttachmentRepository";
import { MongoPhotoRepository } from "./mongo/MongoPhotoRepository";

export class RepositoryFactory {
  private constructor() {}

  static createUserRepository(): IUserRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoUserRepository();
    return new UserRepository();
  }

  static createAttachmentRepository(): IAttachmentRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoAttachmentRepository();
    return new AttachmentRepository();
  }

  static createPhotoRepository(): IPhotoRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoPhotoRepository();
    return new PhotoRepository();
  }

  static async seed(): Promise<void> {
    if (process.env.REPO_TYPE === "mongo") {
      await new MongoUserRepository().seed();
    }
  }
}

