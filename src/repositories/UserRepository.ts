import bcrypt from "bcrypt";
import type { User } from "../types";
import type { IUserRepository } from "./interfaces";

type CreateInput = Omit<User, "id">;
type UpdateInput = Partial<CreateInput>;

const SEED_USER: User = {
  id: crypto.randomUUID(),
  name: "admin",
  email: "admin@spsgroup.com.br",
  type: "admin",
  password: bcrypt.hashSync("1234", 10),
};

export class UserRepository implements IUserRepository {
  users: User[] = [{ ...SEED_USER }];

  async reset(): Promise<void> {
    this.users = [{ ...SEED_USER }];
  }

  async findAll() {
    return this.users;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  async create(data: CreateInput) {
    const user: User = { id: crypto.randomUUID(), ...data };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateInput) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, id };
    return this.users[index];
  }

  async clearPhoto(id: string) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    delete this.users[index].photoId;
    return this.users[index];
  }

  async remove(id: string) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

export const userRepository = new UserRepository();
