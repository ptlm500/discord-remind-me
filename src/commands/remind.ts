import { AutocompleteInteraction, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import reminderQueue from '../queue/reminderQueue';
import * as chrono from 'chrono-node';
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts';

type MessageChoice = {
  sender: string;
  content: string;
  name: string;
  value: string;
}

const humanizer = new HumanizeDuration(new HumanizeDurationLanguage());
humanizer.setOptions({ round: true, largest: 2 });

const handleAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused();
  const choices: MessageChoice[] = [];

  const messages = await interaction.channel?.messages.fetch({ limit: 50 });

  if (messages) {
    messages.forEach(message => {
      if (message.content && message.member) {
        const messageDetails = [interaction.user.id, message.guildId, message.channelId, message.id];
        choices.push({
          sender: message.member.displayName,
          content: message.content,
          name: `${message.member.displayName.substring(0, 15)}: ${message.content.substring(0, 80)}`,
          value: messageDetails.toString(),
        });
      }
    });
  }

  const filtered = choices.filter(choice => choice.sender.includes(focusedValue) || choice.content.includes(focusedValue));

  await interaction.respond(filtered);
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

    await reminderQueue.add({ memberId, guildId, channelId, messageId }, { delay });
    console.log(`reminding in ${delay}`);
    console.log('Reminder queued');

    await interaction.reply({ ephemeral: true, content: `I'll remind you of this message ${humanizer.humanize(delay)} from now` });
  }
};

const parseDateText = (text: string) => {
  const parsedDate = chrono.parseDate(text);

  if (!parsedDate) {
    throw new Error(`I couldn't understand that time "${text}"`);
  }

  return parsedDate;
};

const getMsUntil = (date: Date) => {
  const now = new Date();
  return date.getTime() - now.getTime();
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
        .setRequired(true)),
  handleAutocomplete,
  handleChatInput,
};
