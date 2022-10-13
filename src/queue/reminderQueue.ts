import Queue from 'bull';
import discordClient from '../discordClient';
import { REDIS_URL } from '../constants';
import { EmbedBuilder } from 'discord.js';

type RemindJob = {
  memberId: string;
  guildId: string;
  channelId: string;
  messageId: string;
}

const reminderQueue = new Queue<RemindJob>('reminders', REDIS_URL);

reminderQueue.process(async (job, done) => {
  console.log('Processing reminder');
  const { memberId, guildId, channelId, messageId } = job.data;

  try {
    const channel = await discordClient.channels.fetch(channelId);

    if (channel && channel.isTextBased()) {
      const message = await channel.messages.fetch(messageId);
      const user = await discordClient.users.fetch(memberId);

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('You asked me to remind you of this message')
        .setURL(`https://discord.com/channels/${guildId}/${channelId}/${messageId}`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL()! })
        .setDescription(message.content);

      await user.send({ embeds: [embed] });
    }

    done();
  } catch (e) {
    done(e as Error);
  }
});

export default reminderQueue;
