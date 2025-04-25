import type { Express, Request, Response } from 'express';
import express from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';

configDotenv();

async function main() {
  const app: Express = express();
  const PORT = process.env.PORT || 3000;
  app.use(cors());
  app.use(express.json());
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Bun + Express!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  console.log("hey");
}

main().catch((err) => {
  console.error("❌ Failed to start the server:", err);
  process.exit(1);
});
