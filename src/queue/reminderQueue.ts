import Queue from 'bull';
import discordClient from '../discordClient';
import { REDIS_URL } from '../constants';
import buildReminderEmbed from '../embeds/buildReminderEmbed';

type RemindJob = {
  memberId: string;
  guildId: string;
  channelId: string;
  messageId: string;
}

const reminderQueue = new Queue<RemindJob>(
  'reminders',
  REDIS_URL,
  {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });

reminderQueue.process(async (job, done) => {
  logger.notice(`🔔 Processing reminder ${job.id} attempt ${job.attemptsMade + 1}`);
  const { memberId, channelId, messageId } = job.data;

  try {
    const channel = await discordClient.channels.fetch(channelId);

    if (channel && channel.isTextBased()) {
      const message = await channel.messages.fetch(messageId);
      const user = await discordClient.users.fetch(memberId);

      await user.send(buildReminderEmbed(message, user, new Date(job.timestamp)));
    }

    done();
  } catch (e) {
    logger.error('❗', e);
    done(e as Error);
  }
});

export default reminderQueue;
