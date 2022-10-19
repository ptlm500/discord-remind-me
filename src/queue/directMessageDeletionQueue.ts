import Queue from 'bull';
import discordClient from '../discordClient';
import { REDIS_URL } from '../constants';

type MessageDeletionJob = {
  userId: string;
  messageId: string;
}

const directMessageDeletionQueue = new Queue<MessageDeletionJob>(
  'messageDeletion',
  REDIS_URL,
  {
    defaultJobOptions: {
      delay: 5000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });

directMessageDeletionQueue.process(async (job, done) => {
  logger.notice(`🗑️ Processing message deletion ${job.id} attempt ${job.attemptsMade + 1}`);
  const { userId, messageId } = job.data;

  try {
    const user = await discordClient.users.fetch(userId);
    const channel = user.dmChannel;

    if (channel) {
      const message = await channel.messages.fetch(messageId);

      await message.delete();
    }

    done();
  } catch (e) {
    logger.error('❗', e);
    done(e as Error);
  }
});

export default directMessageDeletionQueue;
