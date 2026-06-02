import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const uploadAny = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export default uploadAny;
