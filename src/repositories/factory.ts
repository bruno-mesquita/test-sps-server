import type { IUserRepository, IAttachmentRepository, IPhotoRepository } from "./interfaces";
import { InMemoryUserRepository } from "./InMemory/InMemoryUserRepository";
import { InMemoryAttachmentRepository } from "./InMemory/InMemoryAttachmentRepository";
import { InMemoryPhotoRepository } from "./InMemory/InMemoryPhotoRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { MongoAttachmentRepository } from "./mongo/MongoAttachmentRepository";
import { MongoPhotoRepository } from "./mongo/MongoPhotoRepository";

let _userRepository: InMemoryUserRepository | undefined;
let _attachmentRepository: InMemoryAttachmentRepository | undefined;
let _photoRepository: InMemoryPhotoRepository | undefined;

export class RepositoryFactory {
  private constructor() {}

  static createUserRepository(): IUserRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoUserRepository();
    if (!_userRepository) _userRepository = new InMemoryUserRepository();
    return _userRepository;
  }

  static createAttachmentRepository(): IAttachmentRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoAttachmentRepository();
    if (!_attachmentRepository) _attachmentRepository = new InMemoryAttachmentRepository();
    return _attachmentRepository;
  }

  static createPhotoRepository(): IPhotoRepository {
    if (process.env.REPO_TYPE === "mongo") return new MongoPhotoRepository();
    if (!_photoRepository) _photoRepository = new InMemoryPhotoRepository();
    return _photoRepository;
  }

  static reset(): void {
    _userRepository?.reset();
    _attachmentRepository?.reset();
    _photoRepository?.reset();
  }
}
