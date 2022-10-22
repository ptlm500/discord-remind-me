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

type MessageUrlOptions = {
  guildId: string;
  channelId: string;
  messageId: string;
}
export const buildDiscordMessageUrl = ({ guildId, channelId, messageId }: MessageUrlOptions) => {
  return `${DISCORD_CHANNEL_URL}${guildId}/${channelId}/${messageId}`;
};

export const buildDiscordProfileUrl = (userId: string) => {
  return `${DISCORD_BASE_URL}users/${userId}`;
};
