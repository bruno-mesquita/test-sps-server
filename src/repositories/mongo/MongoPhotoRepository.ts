import type { Photo } from "../../types";
import type { IPhotoRepository } from "../interfaces";
import { getDb } from "./db";

const COLLECTION = "photos";

function strip(doc: unknown): Photo {
  const { _id, ...rest } = doc as Record<string, unknown>;
  return rest as unknown as Photo;
}

export class MongoPhotoRepository implements IPhotoRepository {
  async createPhoto(data: Omit<Photo, "id">): Promise<Photo> {
    const db = await getDb();
    const photo: Photo = { id: crypto.randomUUID(), ...data };
    await db.collection(COLLECTION).insertOne({ ...photo });
    return photo;
  }

  async findPhotoById(id: string): Promise<Photo | undefined> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ id });
    return doc ? strip(doc as Record<string, unknown>) : undefined;
  }
}

export const mongoPhotoRepository = new MongoPhotoRepository();
