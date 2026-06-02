import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import attachmentsRouter from "./attachments";

const routes = Router();

routes.use(authRouter);
routes.use(usersRouter);
routes.use(attachmentsRouter);

export default routes;
