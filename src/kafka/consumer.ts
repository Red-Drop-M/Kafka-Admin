import { logger } from '../utils/logger';
import { kafka } from './client';

export const startConsumer = async (topic: string) => {
  const consumer = kafka.consumer({ groupId: 'bun-group' });

  try {
    await consumer.connect();
    logger.info(`[Consumer] Connected to Kafka broker`);
    logger.info(`[Consumer] Subscribing to topic "${topic}"...`);
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`[Consumer] ${topic} | ${message.value?.toString()}`);
      },
    });
  } catch (err) {
    logger.error('[Consumer] Error:', err);
    console.error('[Consumer] Error:', err);
  }
};
