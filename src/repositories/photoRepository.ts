import type { Photo } from "../types";
import type { IPhotoRepository } from "./interfaces";

type CreateInput = Omit<Photo, "id">;

export class PhotoRepository implements IPhotoRepository {
  private nextId = 1;
  photos: Photo[] = [];

  async createPhoto(data: CreateInput) {
    const photo: Photo = { id: this.nextId++, ...data };
    this.photos.push(photo);
    return photo;
  }

  async findPhotoById(id: number) {
    return this.photos.find((p) => p.id === id);
  }

  reset() {
    this.photos = [];
    this.nextId = 1;
  }
}

export const photoRepository = new PhotoRepository();
