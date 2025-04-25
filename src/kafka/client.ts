import "../config";
import { logger } from "../utils/logger";
import { Kafka } from "kafkajs";
logger.info(`kafka client id = ${process.env.KAFKA_CLIENT_ID}`);
logger.info(`kafka broker = ${process.env.KAFKA_BROKER}`);
export const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID as string,
    brokers: [process.env.KAFKA_BROKER as string],
})