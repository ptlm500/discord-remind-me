import { parse } from 'chrono-node';
import { AutocompleteInteraction, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import reminderQueue from '../queue/reminderQueue';
import { getMsUntil, parseDateText, humanizeDelay } from '../utils/date';

type MessageChoice = {
  sender: string;
  content: string;
  name: string;
  value: string;
}

const handleAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption.name === 'message') {
    const choices: MessageChoice[] = [];

    const messages = await interaction.channel?.messages.fetch({ limit: 50 });

    if (messages) {
      messages.forEach(message => {
        if (message.content && message.author) {
          const messageDetails = [interaction.user.id, message.guildId, message.channelId, message.id];
          choices.push({
            sender: message.author.username,
            content: message.content,
            name: `${message.author.username.substring(0, 15)}: ${message.content.substring(0, 80)}`,
            value: messageDetails.toString(),
          });
        }
      });
    }

    const filtered = choices.filter(choice => choice.sender.toLowerCase().includes(focusedOption.value) || choice.content.toLowerCase().includes(focusedOption.value));

    await interaction.respond(filtered.slice(0, 24));
  } else if (focusedOption.name === 'when') {
    const parsedTimes = parse(focusedOption.value);

    const options = parsedTimes.map(parsedTime => ({
      name: parsedTime.text,
      value: parsedTime.text,
    }));

    await interaction.respond(options);
  }
};

const handleChatInput = async (interaction: ChatInputCommandInteraction) => {
  const { commandName } = interaction;

  if (commandName === 'remind') {
    const messageDetailsString = interaction.options.getString('message');
    const whenString = interaction.options.getString('when');
    if (!messageDetailsString || !whenString) {
      throw new Error('Invalid interaction');
    }

    const delay = getMsUntil(parseDateText(whenString));

    if (delay < 0) {
      throw new Error('You can\'t remind your past self!');
    }

    const [memberId, guildId, channelId, messageId] = messageDetailsString.split(',');

    const reminder = await reminderQueue.add({ memberId, guildId, channelId, messageId }, { delay });
    console.log(`Reminder ${reminder.id} queued in ${delay}ms`);

    await interaction.reply({ ephemeral: true, content: `I'll remind you of this message in ${humanizeDelay(delay)}` });
  }
};

export default {
  builder: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Remind you of a message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to remind you of')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('when')
        .setDescription('When should I remind you about this message')
        .setAutocomplete(true)
        .setRequired(true)),
  handleAutocomplete,
  handleChatInput,
};
