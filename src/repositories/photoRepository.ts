import type { Photo } from "../types";
import type { IPhotoRepository } from "./interfaces";

type CreateInput = Omit<Photo, "id">;

export class PhotoRepository implements IPhotoRepository {
  photos: Photo[] = [];

  async createPhoto(data: CreateInput) {
    const photo: Photo = { id: crypto.randomUUID(), ...data };
    this.photos.push(photo);
    return photo;
  }

  async findPhotoById(id: string) {
    return this.photos.find((p) => p.id === id);
  }

  reset() {
    this.photos = [];
  }
}

export const photoRepository = new PhotoRepository();
