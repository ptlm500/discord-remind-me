import { parse } from 'chrono-node';
import { AutocompleteInteraction, SlashCommandBuilder, ChatInputCommandInteraction, Collection, Message, AutocompleteFocusedOption } from 'discord.js';
import { buildDiscordMessageUrl } from '../utils/discordUrl';
import { MAXIMUM_DELAY } from '../constants';
import { checkMessageExists } from '../discordClient/message';
import reminderService from '../services/reminderService';
import { getMsUntil, parseDateText, humanizeDelay } from '../utils/date';

const MESSAGE_CHOICE_FETCH_LIMIT = 50;
const CHOICE_REPLY_LIMIT = 24;
const CHOICE_AUTHOR_CHAR_LIMIT = 15;
const CHOICE_MESSAGE_CHAR_LIMIT = 80;

const handleAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption.name === 'message') {
    handleMessageOption(interaction, focusedOption);
  } else if (focusedOption.name === 'when') {
    handleWhenOption(interaction, focusedOption);
  }
};

const handleMessageOption = async (interaction: AutocompleteInteraction, focusedOption: AutocompleteFocusedOption) => {
  const messages = await interaction.channel?.messages.fetch({ limit: MESSAGE_CHOICE_FETCH_LIMIT });

  if (!messages?.size) {
    return;
  }

  const choices = buildAutoCompleteChoices(interaction.user.id, messages)
    .filter(choice => choiceSenderOrMessageIncludes(choice, focusedOption.value))
    .slice(0, CHOICE_REPLY_LIMIT);

  await interaction.respond(choices);
};

const handleWhenOption = async (interaction: AutocompleteInteraction, focusedOption: AutocompleteFocusedOption) => {
  const parsedTimes = parse(focusedOption.value);

  const options = parsedTimes.map(parsedTime => ({
    name: parsedTime.text,
    value: parsedTime.text,
  }));

  await interaction.respond(options);
};

const handleChatInput = async (interaction: ChatInputCommandInteraction) => {
  const reminderOptions = getReminderOptions(interaction);
  await validateReminderOptions(reminderOptions);

  reminderService
    .createReminder(reminderOptions)
    .then(async () => {
      await interaction.reply({
        ephemeral: true,
        content: `I'll remind you of [this message](${buildDiscordMessageUrl(reminderOptions)}) in ${humanizeDelay(reminderOptions.delay)}`,
      });
    });
};

const getReminderOptions = (interaction: ChatInputCommandInteraction) => {
  const [memberId, guildId, channelId, messageId] = interaction.options.getString('message', true).split(',');
  return {
    memberId,
    guildId,
    channelId,
    messageId,
    delay: getMsUntil(parseDateText(interaction.options.getString('when', true))),
  };
};

const validateReminderOptions = async ({ memberId, guildId, channelId, messageId, delay }: { memberId: string, guildId: string, channelId: string, messageId: string, delay: number }) => {
  if (delay < 0) {
    throw new Error('You can\'t remind your past self.');
  } else if (delay > MAXIMUM_DELAY) {
    throw new Error(`You can't set reminders over ${humanizeDelay(MAXIMUM_DELAY)} away.`);
  }

  try {
    await checkMessageExists({ memberId, guildId, channelId, messageId });
  } catch {
    throw new Error('I couldn\' find that message');
  }
};

type MessageChoice = {
  sender: string;
  content: string;
  name: string;
  value: string;
}

const buildAutoCompleteChoices = (callerUserId: string, messages: Collection<string, Message<boolean>>) => {
  const choices: MessageChoice[] = [];
  messages.forEach(message => {
    if (message.cleanContent && message.author) {
      const messageDetails = [callerUserId, message.guildId, message.channelId, message.id];
      choices.push({
        sender: message.author.username,
        content: message.cleanContent,
        name: formatChoiceName(message.author.username, message.cleanContent),
        value: messageDetails.toString(),
      });
    }
  });

  return choices;
};

const formatChoiceName = (username: string, message: string) => {
  return `${username.substring(0, CHOICE_AUTHOR_CHAR_LIMIT)}: ${message.substring(0, CHOICE_MESSAGE_CHAR_LIMIT)}`;
};

const choiceSenderOrMessageIncludes = (choice: MessageChoice, value: string) => {
  return choice.sender.toLowerCase().includes(value)
    || choice.content.toLowerCase().includes(value);
};

export default {
  builder: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Remind you of a message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Select the message to remind you of')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('when')
        .setDescription('When should I remind you about this message?')
        .setAutocomplete(true)
        .setRequired(true)),
  handleAutocomplete,
  handleChatInput,
};
