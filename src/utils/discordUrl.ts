import { Message } from 'discord.js';

const DISCORD_BASE_URL = 'https://discord.com/channels/';

export const parseDiscordMessageUrl = (url: string) => {
  const s = url.split(DISCORD_BASE_URL)[1];
  const [guildId, channelId, messageId] = s.split('/');

  return {
    guildId,
    channelId,
    messageId,
  };
};

export const buildDiscordMessageUrl = (message: Message) => {
  return `${DISCORD_BASE_URL}${message.guildId}/${message.channelId}/${message.id}`;
};
