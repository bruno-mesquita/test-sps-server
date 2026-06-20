import type { User } from "../../types";
import type { IUserRepository } from "../interfaces";
import { getDb } from "./db";

const COLLECTION = "users";

function strip(doc: unknown): User {
  const { _id, ...rest } = doc as Record<string, unknown>;
  return rest as unknown as User;
}

export class MongoUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const db = await getDb();
    const docs = await db.collection(COLLECTION).find({}).toArray();
    return docs.map((d) => strip(d as Record<string, unknown>));
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ email });
    return doc ? strip(doc as Record<string, unknown>) : undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ id });
    return doc ? strip(doc as Record<string, unknown>) : undefined;
  }

  async create(data: Omit<User, "id">): Promise<User> {
    const db = await getDb();
    const user: User = { id: crypto.randomUUID(), ...data };
    await db.collection(COLLECTION).insertOne({ ...user });
    return user;
  }

  async update(id: string, data: Partial<Omit<User, "id">>): Promise<User | null> {
    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" },
    );
    return result ? strip(result as Record<string, unknown>) : null;
  }

  async clearPhoto(id: string): Promise<User | null> {
    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { id },
      { $unset: { photoId: "" } },
      { returnDocument: "after" },
    );
    return result ? strip(result as Record<string, unknown>) : null;
  }

  async remove(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection(COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export const mongoUserRepository = new MongoUserRepository();
