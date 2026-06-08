import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "./interfaces";
import { UserRepository } from "./UserRepository";
import { AttachmentRepository } from "./attachmentRepository";
import { PhotoRepository } from "./photoRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { MongoAttachmentRepository } from "./mongo/MongoAttachmentRepository";
import { MongoPhotoRepository } from "./mongo/MongoPhotoRepository";

export interface Repositories {
  userRepo: IUserRepository;
  attachmentRepo: IAttachmentRepository;
  photoRepo: IPhotoRepository;
}

export class RepositoryFactory {
  static create(): Repositories {
    if (process.env.REPO_TYPE === "mongo") {
      return {
        userRepo: new MongoUserRepository(),
        attachmentRepo: new MongoAttachmentRepository(),
        photoRepo: new MongoPhotoRepository(),
      };
    }
    return {
      userRepo: new UserRepository(),
      attachmentRepo: new AttachmentRepository(),
      photoRepo: new PhotoRepository(),
    };
  }

  static async seed(repos: Repositories): Promise<void> {
    if (repos.userRepo instanceof MongoUserRepository) {
      await repos.userRepo.seed();
    }
  }
}

export const repositories = RepositoryFactory.create();
