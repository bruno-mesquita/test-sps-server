import "dotenv/config";
import app from "./app";
import { getDb } from "./repositories/mongo/db";

const port = process.env.PORT ?? 3000;

async function main() {
  await getDb();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main();
