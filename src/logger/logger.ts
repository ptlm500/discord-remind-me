import winston, { format } from 'winston';
import Sentry from 'winston-transport-sentry-node';
import { PROD, SENTRY_DSN } from '../constants';

function getLoggingLevel() {
  if (PROD) {
    return 'info';
  }
  return 'debug';
}

const transports : winston.transport[] = [
  new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }),
  new Sentry({
    sentry: {
      dsn: SENTRY_DSN,
    },
    level: 'warning',
  }),
];

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: getLoggingLevel(),
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'remind-me' },
  transports,
});

export default logger;
