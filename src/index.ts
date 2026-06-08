import "dotenv/config";
import app from "./app";
import { repositories, RepositoryFactory } from "./repositories/factory";

const port = process.env.PORT ?? 3000;

RepositoryFactory.seed().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
