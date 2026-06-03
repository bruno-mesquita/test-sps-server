import type { Photo } from "../types";

type CreateInput = Omit<Photo, "id">;

let nextId = 1;

class PhotoRepository {
  photos: Photo[] = [];

  async createPhoto(data: CreateInput) {
    const photo: Photo = { id: nextId++, ...data };
    this.photos.push(photo);
    return photo;
  }

  async findPhotoById(id: number) {
    return this.photos.find((p) => p.id === id);
  }

  reset() {
    this.photos = [];
    nextId = 1;
  }
}

export const photoRepository = new PhotoRepository();
