import bcrypt from "bcrypt";
import type { User } from "../types";
import type { IUserRepository } from "./interfaces";

type CreateInput = Omit<User, "id">;
type UpdateInput = Partial<CreateInput>;

const SEED_PASSWORD_HASH = bcrypt.hashSync("1234", 10);

const SEED_USER: User = {
  id: 1,
  name: "admin",
  email: "admin@spsgroup.com.br",
  type: "admin",
  password: SEED_PASSWORD_HASH,
};

export class UserRepository implements IUserRepository {
  private nextId = 2;
  users: User[] = [{ ...SEED_USER }];

  async reset(): Promise<void> {
    this.users = [{ ...SEED_USER }];
    this.nextId = 2;
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
    const user: User = { id: this.nextId++, ...data };
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
