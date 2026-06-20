import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "./interfaces";
import { UserRepository } from "./UserRepository";
import { AttachmentRepository } from "./attachmentRepository";
import { PhotoRepository } from "./photoRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { MongoAttachmentRepository } from "./mongo/MongoAttachmentRepository";
import { MongoPhotoRepository } from "./mongo/MongoPhotoRepository";

let _userRepository: UserRepository | undefined;
let _attachmentRepository: AttachmentRepository | undefined;
let _photoRepository: PhotoRepository | undefined;

export class RepositoryFactory {
  private constructor() {}

  static createUserRepository(): IUserRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoUserRepository();
    if (!_userRepository) _userRepository = new UserRepository();
    return _userRepository;
  }

  static createAttachmentRepository(): IAttachmentRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoAttachmentRepository();
    if (!_attachmentRepository) _attachmentRepository = new AttachmentRepository();
    return _attachmentRepository;
  }

  static createPhotoRepository(): IPhotoRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoPhotoRepository();
    if (!_photoRepository) _photoRepository = new PhotoRepository();
    return _photoRepository;
  }

  static reset(): void {
    _userRepository?.reset();
    _attachmentRepository?.reset();
    _photoRepository?.reset();
  }
}

