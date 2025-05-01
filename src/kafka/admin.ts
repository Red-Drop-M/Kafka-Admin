import { kafka } from './client';
import { logger } from '../utils/logger';
export const listTopics = async (): Promise<string[]> => {
  const admin = kafka.admin();
  logger.info('connecting to admin kafka');

  try {
    await admin.connect();
    logger.info('connected to admin kafka');

    const topics = await admin.listTopics();
    logger.info({ topics }, 'fetched topics');

    return topics;
  } catch (err) {
    logger.error({ err }, '❌ error in listTopics');
    throw err;
  } finally {
    try {
      await admin.disconnect();
      logger.info('disconnected from admin kafka');
    } catch (err) {
      logger.error({ err }, '❌ error disconnecting admin');
    }
  }
};
export const createTopic = async (topicName: string) => {
  const admin = kafka.admin();
  await admin.connect();
  logger.info(`connected to admin kafka`);

  await admin.createTopics({
    topics: [{ topic: topicName, numPartitions: 1, replicationFactor: 1 }],
  });

  await admin.disconnect();
};

export const deleteTopic = async (topicName: string) => {
  const admin = kafka.admin();
  await admin.connect();
  await admin.deleteTopics({ topics: [topicName] });
  await admin.disconnect();
};
