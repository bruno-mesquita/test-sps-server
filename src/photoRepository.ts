import type { Photo } from "./types";

type CreateInput = Omit<Photo, "id">;

let nextId = 1;
const photos: Photo[] = [];

export const createPhoto = (data: CreateInput): Photo => {
  const photo: Photo = { id: nextId++, ...data };
  photos.push(photo);
  return photo;
};

export const findPhotoById = (id: number): Photo | undefined =>
  photos.find((p) => p.id === id);
