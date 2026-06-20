import "dotenv/config";
import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "../repositories/InMemory/InMemoryUserRepository";
import { AuthService } from "../services/authService";

let authService: AuthService;

beforeEach(() => {
  authService = new AuthService(new InMemoryUserRepository());
});

describe("AuthService.login", () => {
  it("retorna JWT com credenciais válidas", async () => {
    const token = await authService.login("admin@spsgroup.com.br", "1234");
    expect(typeof token).toBe("string");
    expect(token).not.toBeNull();
  });

  it("retorna null com senha errada", async () => {
    const token = await authService.login("admin@spsgroup.com.br", "wrong");
    expect(token).toBeNull();
  });

  it("retorna null com email inexistente", async () => {
    const token = await authService.login("nobody@test.com", "1234");
    expect(token).toBeNull();
  });

  it("token gerado contém payload correto", async () => {
    const token = await authService.login("admin@spsgroup.com.br", "1234");
    const jwt = await import("jsonwebtoken");
    const payload = jwt.default.decode(token as string) as Record<string, unknown>;
    expect(payload.email).toBe("admin@spsgroup.com.br");
    expect(payload.type).toBe("admin");
    expect(typeof payload.id).toBe("string");
  });
});
