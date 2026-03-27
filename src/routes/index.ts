import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";

const routes = Router();

routes.use(authRouter);
routes.use(usersRouter);

export default routes;
