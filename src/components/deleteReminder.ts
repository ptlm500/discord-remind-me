import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import interactionService from '../services/interactionService';

const ID = 'deleteReminder';

const builder = new ButtonBuilder()
  .setCustomId(ID)
  .setLabel('Delete')
  .setStyle(ButtonStyle.Danger);

const handleInteraction = async (interaction: ButtonInteraction) => {
  await interactionService.deleteInteractionMessage(interaction);
};

export default {
  builder,
  handleInteraction,
};
