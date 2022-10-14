export default (url: string) => {
  const s = url.split('https://discord.com/channels/')[1];
  const [guildId, channelId, messageId] = s.split('/');

  return {
    guildId,
    channelId,
    messageId,
  };
};
