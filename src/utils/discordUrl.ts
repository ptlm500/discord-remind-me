import { Message } from 'discord.js';

const DISCORD_BASE_URL = 'https://discord.com/';
const DISCORD_CHANNEL_URL = `${DISCORD_BASE_URL}channels/`;

export const parseDiscordMessageUrl = (url: string) => {
  const s = url.split(DISCORD_CHANNEL_URL)[1];
  const [guildId, channelId, messageId] = s.split('/');

  return {
    guildId,
    channelId,
    messageId,
  };
};

export const buildDiscordMessageUrl = (message: Message) => {
  return `${DISCORD_CHANNEL_URL}${message.guildId}/${message.channelId}/${message.id}`;
};

export const buildDiscordProfileUrl = (userId: string) => {
  return `${DISCORD_BASE_URL}users/${userId}`;
};
