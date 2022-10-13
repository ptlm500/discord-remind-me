import * as dotenv from 'dotenv';
dotenv.config();

import { DISCORD_TOKEN } from './constants';
import discordClient from './discordClient';
import reminderQueue from './queue/reminderQueue';

const main = async () => {
  await discordClient.login(DISCORD_TOKEN);
  console.log('Logged in');

  const isReady = await reminderQueue.isReady();

  if (isReady) {
    console.log('Redis ready');
  }
};

main().catch(err => {
  console.error(err);
});
