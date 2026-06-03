import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";

export class AuthService {
  async login(email: string, password: string): Promise<string | null> {
    const user = await userRepository.findByEmail(email);
    if (!user || user.password !== password) return null;

    return jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" },
    );
  }
}

export const authService = new AuthService();
