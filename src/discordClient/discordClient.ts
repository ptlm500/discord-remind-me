import { Client, GatewayIntentBits } from 'discord.js';
import registerCommands from '../commands/registerCommands';
import commands from '../commands';
import components from '../components';
import interactionService from '../services/interactionService';
import { handleContextMenu } from '../commands/reminderContextMenu';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', async () => {
  await registerCommands();
  logger.notice('🚀 Ready');
});

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    commands.get(interaction.commandName)?.handleAutocomplete(interaction)
      .catch(e => logger.error('❗ Couldn\'t handle autocomplete', e));
  } else if (interaction.isChatInputCommand()) {
    commands.get(interaction.commandName)?.handleChatInput(interaction)
      .catch(async e => {
        logger.error('❗ Couldn\'t handle chat input', e);
        await interactionService.replyWithError(e, interaction);
      });
  } else if (interaction.isSelectMenu()) {
    components.selectMenus.get(interaction.customId)?.handleInteraction(interaction)
      .catch(e => logger.error('❗ Couldn\'t handle select menu', e));
  } else if (interaction.isButton()) {
    components.buttons.get(interaction.customId)?.handleInteraction(interaction)
      .catch(e => logger.error('❗ Couldn\'t handle button', e));
  } else if (interaction.isMessageContextMenuCommand()) {
    handleContextMenu(interaction)
      .catch(e => logger.error('❗ Couldn\'t handle context menu', e));
  }
});

export default client;
