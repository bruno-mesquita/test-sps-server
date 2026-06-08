import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RepositoryFactory } from "../repositories/factory";
import type { IUserRepository } from "../repositories/interfaces";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(email: string, password: string): Promise<string | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) return null;

    return jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" },
    );
  }
}

export const authService = new AuthService(RepositoryFactory.createUserRepository());
