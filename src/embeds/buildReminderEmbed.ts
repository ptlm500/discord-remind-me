import { Message, User, EmbedBuilder, ActionRowBuilder, MessageCreateOptions, SelectMenuBuilder, ButtonBuilder } from 'discord.js';
import deleteReminder from '../components/deleteReminder';
import snoozeReminder from '../components/snoozeReminder';
import { buildDiscordMessageUrl } from '../utils/discordUrl';

const buildReminderEmbed = (message: Message, user: User): MessageCreateOptions => {
  const selectRow = new ActionRowBuilder<SelectMenuBuilder>()
    .addComponents(snoozeReminder.builder);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(deleteReminder.builder);

  const embed = new EmbedBuilder()
    .setColor(user.accentColor || 0x0099FF)
    .setTitle('You asked me to remind you of this message')
    .setURL(buildDiscordMessageUrl(message))
    .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() || undefined })
    .setDescription(message.content.substring(0, 4096));

  const firstAttachment = message.attachments.first();
  if (firstAttachment?.url) {
    embed.setImage(firstAttachment.url);
  }

  return { embeds: [embed], components: [selectRow, buttonRow] };
};

export default buildReminderEmbed;
