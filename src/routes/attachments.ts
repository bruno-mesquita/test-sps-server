import { Router } from "express";
import auth from "../middleware/auth";
import uploadAny from "../middleware/uploadAny";
import { attachmentController } from "../controllers/AttachmentController";

const router = Router();

router.post("/users/:id/attachments", auth, uploadAny.array("files", 10), (req, res) =>
  attachmentController.upload(req, res),
);
router.get("/users/:id/attachments", auth, (req, res) => attachmentController.list(req, res));
router.delete("/users/:id/attachments/:attachmentId", auth, (req, res) =>
  attachmentController.remove(req, res),
);

export default router;
