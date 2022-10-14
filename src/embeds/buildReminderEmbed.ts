import { Message, User, EmbedBuilder, ActionRowBuilder, MessageCreateOptions, SelectMenuBuilder } from 'discord.js';
import snoozeReminder from '../components/snoozeReminder';

const buildReminderEmbed = (message: Message, user: User): MessageCreateOptions => {
  const row = new ActionRowBuilder<SelectMenuBuilder>()
    .addComponents(snoozeReminder.builder);

  const embed = new EmbedBuilder()
    .setColor(user.accentColor || 0x0099FF)
    .setTitle('You asked me to remind you of this message')
    .setURL(`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`)
    .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() || undefined })
    .setDescription(message.content);

  return { embeds: [embed], components: [row] };
};

export default buildReminderEmbed;
