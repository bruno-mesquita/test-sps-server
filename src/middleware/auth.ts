import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types";

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  auth(req, res, () => {
    if (req.user?.type !== "admin") {
      res.status(403).json({ error: "Acesso restrito a administradores" });
      return;
    }
    next();
  });
};

export default auth;
