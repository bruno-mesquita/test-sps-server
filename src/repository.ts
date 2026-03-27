import type { User } from "./types";

type CreateInput = Omit<User, "id">;
type UpdateInput = Partial<CreateInput>;

let nextId = 2;

const users: User[] = [
  {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "1234",
  },
];

export const reset = (): void => {
  users.splice(0, users.length, {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "1234",
  });
  nextId = 2;
};

export const findAll = (): User[] => users;

export const findByEmail = (email: string): User | undefined =>
  users.find((u) => u.email === email);

export const findById = (id: number): User | undefined =>
  users.find((u) => u.id === id);

export const create = (data: CreateInput): User => {
  const user: User = { id: nextId++, ...data };
  users.push(user);
  return user;
};

export const update = (id: number, data: UpdateInput): User | null => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data, id };
  return users[index];
};

export const remove = (id: number): boolean => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};
