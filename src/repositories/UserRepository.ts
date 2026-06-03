import bcrypt from "bcrypt";
import type { User } from "../types";

type CreateInput = Omit<User, "id">;
type UpdateInput = Partial<CreateInput>;

let nextId = 2;

const SEED_PASSWORD_HASH = bcrypt.hashSync("1234", 10);

export class UserRepository {
  users: User[] = [
    {
      id: 1,
      name: "admin",
      email: "admin@spsgroup.com.br",
      type: "admin",
      password: SEED_PASSWORD_HASH,
    },
  ];

  async reset(): Promise<void> {
    this.users.splice(0, this.users.length, {
      id: 1,
      name: "admin",
      email: "admin@spsgroup.com.br",
      type: "admin",
      password: SEED_PASSWORD_HASH,
    });
    nextId = 2;
  }

  async findAll() {
    return this.users;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  async findById(id: number) {
    return this.users.find((u) => u.id === id);
  }

  async create(data: CreateInput) {
    const user: User = { id: nextId++, ...data };
    this.users.push(user);
    return user;
  }

  async update(id: number, data: UpdateInput) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, id };
    return this.users[index];
  }

  async clearPhoto(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    delete this.users[index].photoId;
    return this.users[index];
  }

  async remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

export const userRepository = new UserRepository();
