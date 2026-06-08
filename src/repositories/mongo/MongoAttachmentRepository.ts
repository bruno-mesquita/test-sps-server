import type { Attachment } from "../../types";
import type { IAttachmentRepository } from "../interfaces";
import { getDb } from "./db";

const COLLECTION = "attachments";

function strip(doc: unknown): Attachment {
  const { _id, ...rest } = doc as Record<string, unknown>;
  return rest as unknown as Attachment;
}

export class MongoAttachmentRepository implements IAttachmentRepository {
  async createAttachment(data: Omit<Attachment, "id" | "createdAt">): Promise<Attachment> {
    const db = await getDb();
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    await db.collection(COLLECTION).insertOne({ ...attachment });
    return attachment;
  }

  async findByUserId(userId: string): Promise<Attachment[]> {
    const db = await getDb();
    const docs = await db.collection(COLLECTION).find({ userId }).toArray();
    return docs.map((d) => strip(d as Record<string, unknown>));
  }

  async findById(id: string): Promise<Attachment | undefined> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ id });
    return doc ? strip(doc as Record<string, unknown>) : undefined;
  }

  async getCountByUserId(userId: string): Promise<number> {
    const db = await getDb();
    return db.collection(COLLECTION).countDocuments({ userId });
  }

  async removeAttachment(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection(COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export const mongoAttachmentRepository = new MongoAttachmentRepository();
