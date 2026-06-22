import "dotenv/config";
import app from "./app";

const port = process.env.PORT ?? 3000;

async function main() {
  if(process.env.REPO_TYPE === 'mongo') {
    const { getDb } = await import('./repositories/mongo/db');
    await  getDb();
  };
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Docs is running on http://localhost:${port}/docs`);
  });
}

main();
