import client from './discordClient';

export const checkMessageExists = async ({ memberId, guildId, channelId, messageId }: { memberId: string, guildId: string, channelId: string, messageId: string }) => {
  const guild = await client.guilds.fetch(guildId)
    .catch(() => { throw new Error(`The server "${guildId}" doesn't exist.`); });
  await guild.members.fetch(memberId)
    .catch(() => { throw new Error(`The user "${memberId}" doesn't exist.`); });
  const channel = await guild.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    throw new Error(`The channel "${memberId}" isn't a valid text channel.`);
  }
  await channel.messages.fetch(messageId)
    .catch(() => { throw new Error(`The message "${messageId}" doesn't exist in channel ${channelId}.`); });

  return true;
};