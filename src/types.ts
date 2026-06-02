export interface Photo {
  id: number;
  filename: string;
  previewUrl: string;
  originalUrl: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  password: string;
  photoId?: number;
}

export interface JwtPayload {
  id: number;
  email: string;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
