import { secondsInMonth } from 'date-fns';

const getEnvVar = (name: string) => {
  const value = process.env[name];

  if (value) {
    return value;
  }

  throw new Error(`${name} not set.`);
};

export const PROD = process.env.NODE_ENV === 'production';
export const DISCORD_TOKEN = getEnvVar('DISCORD_TOKEN');
export const CLIENT_ID = getEnvVar('CLIENT_ID');
export const GUILD_ID = getEnvVar('GUILD_ID');
export const REDIS_URL = getEnvVar('REDIS_URL');
export const MAXIMUM_DELAY = 3 * secondsInMonth * 1000;
export const SENTRY_DSN = PROD ? getEnvVar('SENTRY_DSN') : '';
