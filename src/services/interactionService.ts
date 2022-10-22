import { MessageComponentInteraction, RepliableInteraction } from 'discord.js';
import discordClient from '../discordClient/discordClient';
import directMessageDeletionQueue from '../queue/directMessageDeletionQueue';

const deleteInteractionMessage = async (interaction: MessageComponentInteraction) => {
  // Ensure we have the DM channel in the cache
  await discordClient.channels.fetch(interaction.message.channelId);
  await interaction.message.delete();
};

const replyWithSelfDeletingMessage = async (interaction: RepliableInteraction, replyContent: string) => {
  await interaction.reply(replyContent);
  const reply = await interaction.fetchReply();

  await directMessageDeletionQueue.add({
    userId: interaction.user.id,
    messageId: reply.id,
  });
};

const replyWithError = async (error: Error, interaction: RepliableInteraction) => {
  await interaction.reply({ content: `❗ ${error.message}`, ephemeral: true });
};

export default {
  deleteInteractionMessage,
  replyWithSelfDeletingMessage,
  replyWithError,
};
