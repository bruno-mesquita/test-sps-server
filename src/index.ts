import "dotenv/config";
import app from "./app";
import { RepositoryFactory } from "./repositories/factory";
import { getDb } from "./repositories/mongo/db";

const port = process.env.PORT ?? 3000;

async function main() {
  await getDb();
  await RepositoryFactory.seed();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main();
