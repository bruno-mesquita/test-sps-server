export interface Photo {
  id: string;
  filename: string;
  previewUrl: string;
  originalUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  password: string;
  photoId?: string;
}

export interface Attachment {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface JwtPayload {
  id: string;
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
