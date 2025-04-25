import "./config";
import type { Express, Request, Response } from 'express';
import express from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import { createTopic, deleteTopic, listTopics} from './kafka/admin';
import { logger } from './utils/logger';
configDotenv();

async function main() {
  const app: Express = express();

  const PORT = process.env.PORT;
  app.use(cors({
    origin: '*',
  }));

  app.get("/", (req: Request, res: Response) => {
    logger.info("Hello from Bun + Express!");
    res.send("Hello from Bun + Express!");
  });


  app.get('/topics', async (req, res) => {
    try {
      logger.info("Fetching topics...");
      const topics = await listTopics();
      logger.info(`Topics: ${topics}`);
      res.status(200).json({ topics });
    } catch (err) {
      logger.error('Error fetching topics:', err);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });
  app.use(express.json());
  app.post('/topics', async (req, res) => {
    
  
    const { topic } = req.body;
    logger.info(`Creating topic: ${topic}`);
    try {
      await createTopic(topic);
      logger.info(`Topic ${topic} created`);
      res.json({ status: `Topic ${topic} created` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create topic' });
    }
  });
  app.delete("/topics/:topic", async (req: Request, res: Response) => {
    const { topic } = req.params;
    try{
      if(!topic){
        logger.error("Topic name is required");
        res.status(400).json({ error: "Topic name is required" });
      }
      await deleteTopic(topic as string);
      logger.info(`Topic ${topic} deleted`);
      res.status(204).json({ status: `Topic ${topic} deleted` });
    }catch(err){
      logger.error("Error deleting topic:", err);
      res.status(500).json({ error: "Failed to delete topic" });
    } 
  })
  
  
  
   

  app.listen(PORT, () => {
    logger.info(`kafka broker : ${process.env.KAFKA_BROKER}`);
    logger.info(`kafka client id : ${process.env.KAFKA_CLIENT_ID}`);
    logger.info(`Server is running at http://localhost:${PORT}`);
  });

  console.log("hey");
}

main().catch((err) => {
  logger.error("❌ Failed to start the server:", err);
  process.exit(1);
});
