import { kafka } from './client';
import { logger } from '../utils/logger';

const producer = kafka.producer();


export const sendMessage = async <T>(topic: string, message: T) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.info(`[Producer] Message sent to topic "${topic},"`, message);
  } catch (err) {
    logger.error('[Producer] Error:', err);
  } finally {
    logger.info('[Producer] Disconnecting...');
    await producer.disconnect();
  }
};
