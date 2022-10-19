import * as dotenv from 'dotenv';
dotenv.config();

import { DISCORD_TOKEN } from './constants';
import discordClient from './discordClient';
import logger from './logger/logger';
import reminderQueue from './queue/reminderQueue';

global.logger = logger;

const main = async () => {
  logger.notice('⌛ Connecting discord client');
  await discordClient.login(DISCORD_TOKEN);
  logger.notice('✅ Logged in');

  const isReady = await reminderQueue.isReady();

  if (isReady) {
    logger.notice('✅ Redis ready');
  }
};

main().catch(e => {
  logger.error('❗', e);
});
