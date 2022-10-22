import { millisecondsInHour } from 'date-fns';
import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction } from 'discord.js';
import { getMsUntilTomorrowAt, humanizeDelay } from '../utils/date';
import reminderService from '../services/reminderService';
import { buildDiscordMessageUrl } from '../utils/discordUrl';

const contextMenuOptions = [
  {
    name: 'Remind in 1 hour',
    getDelay: () => millisecondsInHour,
  },
  {
    name: 'Remind in 3 hours',
    getDelay: () => millisecondsInHour * 3,
  },
  {
    name: 'Remind next morning',
    getDelay: () => getMsUntilTomorrowAt(9),
  },
  {
    name: 'Remind next evening',
    getDelay: () => getMsUntilTomorrowAt(19),
  },
];

export const buildContextCommands = () => contextMenuOptions.map(option => new ContextMenuCommandBuilder()
  .setName(option.name)
  .setType(ApplicationCommandType.Message)
  .setDMPermission(false));

export const handleContextMenu = async (interaction: MessageContextMenuCommandInteraction) => {
  const reminderOptions = getReminderOptions(interaction);

  reminderService
    .createReminder(reminderOptions)
    .then(async () => {
      await interaction.reply({
        ephemeral: true,
        content: `I'll remind you of [this message](${buildDiscordMessageUrl(reminderOptions)}) in ${humanizeDelay(reminderOptions.delay)}`,
      });
    });
};

const getReminderOptions = (interaction: MessageContextMenuCommandInteraction) => {
  const getDelay = contextMenuOptions
    .find(option => option.name === interaction.commandName)?.getDelay;

  if (!interaction.targetMessage.guildId || !interaction.targetMessage.channelId || !getDelay) {
    throw new Error('Not a valid command.');
  }

  return {
    memberId: interaction.user.id,
    guildId: interaction.targetMessage.guildId,
    channelId: interaction.targetMessage.channelId,
    messageId: interaction.targetMessage.id,
    delay: getDelay(),
  };
};
