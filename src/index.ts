import "./config";
import express, { type Express, type Request, type Response, type NextFunction, type ErrorRequestHandler,type RequestHandler } from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import { createTopic, deleteTopic, listTopics } from './kafka/admin';
import { logger } from './utils/logger';
import { startConsumer } from './kafka/consumer';
import { sendMessage } from './kafka/producer';
import { donorPledgeHandler } from "./services/DonorPledge";
configDotenv();

async function main() {
  const app: Express = express();
  const PORT = process.env.PORT || 3000;

  // Start Kafka consumer for "blood-request-created" topic
  startConsumer("blood-request-created", (message: string) => {
    logger.info(`[blood-request-created] ${message}`);
  }).catch((err) => {
    logger.error("❌ Failed to start consumer for 'blood-request-created':", err);
  });

  app.use(cors({ origin: '*' }));

  // Increase the limit for JSON bodies
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      // This will be called when the parsing is complete
      // If we got here, the body parser was able to parse the request
      logger.debug('Request body parsed successfully');
    }
  }));

  // Add URL-encoded parser with increased limits if needed
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get("/", (req: Request, res: Response) => {
    logger.info("Hello from Bun + Express!");
    res.send("Hello from Bun + Express!");
  });

  app.get('/topics', async (req: Request, res: Response) => {
    try {
      const topics = await listTopics();
      res.status(200).json({ topics });
    } catch (err) {
      logger.error('Error fetching topics:', err);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

  app.post('/donor-pledge', donorPledgeHandler)

  app.post('/topics', async (req: Request, res: Response) => {
    const { topic } = req.body;
    try {
      await createTopic(topic);
      res.json({ status: `Topic ${topic} created` });
    } catch (err) {
      logger.error('Error creating topic:', err);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  });

  app.delete("/topics/:topic", async (req: Request, res: Response) => {
    const { topic } = req.params;
    try {
      if (!topic) throw new Error("Topic name is required");
      await deleteTopic(topic);
      res.status(200).json({ status: `Topic ${topic} deleted` });
    } catch (err) {
      logger.error("Error deleting topic:", err);
      res.status(500).json({ error: "Failed to delete topic" });
    }
  });

 // Explicitly type the middleware as ErrorRequestHandler
app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
  const error = err; // No need for type assertion now
  
  if (error.type === 'entity.too.large') {
    logger.error('Request entity too large');
    res.status(413).json({ error: 'Request entity too large' });
    return;
  }
  
  if (error.status === 400 && error.message.includes('content length')) {
    logger.error(`Content length mismatch: ${req.method} ${req.originalUrl}`, {
      headers: req.headers,
      path: req.path,
      ip: req.ip
    });
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }
  
  logger.error('Internal server error:', error);
  res.status(500).json({ error: 'Internal server error' });
}) as ErrorRequestHandler); // Type assertion here

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Kafka broker: ${process.env.KAFKA_BROKER}`);
    logger.info(`Kafka client ID: ${process.env.KAFKA_CLIENT_ID}`);
  });
}

main().catch((err) => {
  logger.error("❌ Server startup failed:", err);
  process.exit(1);
});