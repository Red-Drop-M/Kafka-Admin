import { logger } from '../utils/logger';
import { kafka } from './client';

export const startConsumer = async (
  topic: string,
  onMessage?: (message: string) => void
) => {
  const consumer = kafka.consumer({ groupId: 'bun-group' });

  try {
    await consumer.connect();
    logger.info(`[Consumer] Connected to Kafka broker`);
    logger.info(`[Consumer] Subscribing to topic "${topic}"...`);
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msg = message.value?.toString() ?? '';
        if (onMessage) {
          onMessage(msg);
        } else {
          logger.info(`[Consumer] ${topic} | ${msg}`);
        }
      },
    });
  } catch (err) {
    logger.error('[Consumer] Error:', err);
    console.error('[Consumer] Error:', err);
  }
};


