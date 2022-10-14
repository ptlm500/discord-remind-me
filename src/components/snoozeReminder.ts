import { SelectMenuBuilder, SelectMenuInteraction } from 'discord.js';
import reminderQueue from '../queue/reminderQueue';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const FIVE_MINS_IN_MS = 5 * 60 * 1000;
const ID = 'snoozeReminder';

const builder = new SelectMenuBuilder()
  .setCustomId(ID)
  .setPlaceholder('Snooze reminder for')
  .addOptions(
    {
      label: '10 seconds',
      description: 'Remind you of this message again in 10 seconds',
      value: `${10 * 1000}`,
    },
    {
      label: '5 minutes from now',
      description: 'Remind you of this message again in 5 minutes',
      value: `${FIVE_MINS_IN_MS}`,
    },
    {
      label: '1 hour from now',
      description: 'Remind you of this message again in an hour',
      value: `${ONE_HOUR_IN_MS}`,
    },
  );


const handleInteraction = async (interaction: SelectMenuInteraction) => {
  if (!interaction.channel?.isDMBased()) {
    throw new Error('Can\'t snooze reminders outside of DMs');
  }
  if (!interaction.message.embeds[0].url) {
    throw new Error('Original message embed has no URL');
  }

  const delay = parseInt(interaction.values[0], 10);
  await reminderQueue.add(
    {
      memberId: interaction.channel.recipientId,
      ...parseDiscordMessageUrl(interaction.message.embeds[0].url),
    },
    {
      delay,
    },
  );

  await interaction.reply(`Snoozed for ${interaction.values[0]} ms`);
  await interaction.message.delete();
};

const parseDiscordMessageUrl = (url: string) => {
  const s = url.split('https://discord.com/channels/')[1];
  const [guildId, channelId, messageId] = s.split('/');

  return {
    guildId,
    channelId,
    messageId,
  };
};

export default {
  builder,
  handleInteraction,
};
