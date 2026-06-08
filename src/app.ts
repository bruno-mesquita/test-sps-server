import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import swaggerSpec from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);

export default app;
