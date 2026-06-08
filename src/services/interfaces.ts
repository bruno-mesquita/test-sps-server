import type { Photo } from "../types";
import type { StoredFile } from "./storageService";

export interface IPhotoService {
  processPhoto(file: StoredFile): Promise<Photo>;
}
