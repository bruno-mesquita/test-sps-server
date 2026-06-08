import type { Photo } from "../types";

export interface IPhotoService {
  processPhoto(file: Express.Multer.File): Promise<Photo>;
}
