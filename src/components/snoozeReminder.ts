import { RepliableInteraction, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js';
import { humanizeDelay, getMsUntilTomorrowAt } from '../utils/date';
import reminderQueue from '../queue/reminderQueue';
import directMessageDeletionQueue from '../queue/directMessageDeletionQueue';
import parseDiscordMessageUrl from '../utils/parseDiscordMessageUrl';
import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

const ID = 'snoozeReminder';

const builder = new SelectMenuBuilder()
  .setCustomId(ID)
  .setPlaceholder('Snooze reminder for')
  .addOptions(
    {
      label: '5 minutes',
      description: 'Remind you of this message again in 5 minutes',
      value: `${minutesToMilliseconds(5)}`,
    },
    {
      label: '1 hour',
      description: 'Remind you of this message again in an hour',
      value: `${hoursToMilliseconds(1)}`,
    },
    {
      label: 'Tomorrow morning',
      description: 'Remind you of this message again tomorrow at 9:00 AM',
      value: `${getMsUntilTomorrowAt(9)}`,
    },
    {
      label: 'Tomorrow evening',
      description: 'Remind you of this message again tomorrow at 7:00 PM',
      value: `${getMsUntilTomorrowAt(19)}`,
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

  if (isNaN(delay)) {
    throw new Error(`Couldn't parse, "${interaction.values[0]}"`);
  }

  await reminderQueue.add(
    {
      memberId: interaction.channel.recipientId,
      ...parseDiscordMessageUrl(interaction.message.embeds[0].url),
    },
    {
      delay,
    },
  );

  await replyWithSelfDeletingDM(interaction, `Snoozed for ${humanizeDelay(delay)}`);

  await interaction.message.delete();
};

const replyWithSelfDeletingDM = async (interaction: RepliableInteraction, replyContent: string) => {
  if (!interaction.channel?.isDMBased()) return;
  await interaction.reply(replyContent);
  const reply = await interaction.fetchReply();

  await directMessageDeletionQueue.add({
    userId: interaction.channel.recipientId,
    messageId: reply.id,
  });
};

export default {
  builder,
  handleInteraction,
};
