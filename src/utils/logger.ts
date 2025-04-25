import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty', // optional, for human-readable logs
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});
