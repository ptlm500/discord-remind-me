import { Client, GatewayIntentBits } from 'discord.js';
import registerCommands from './commands/registerCommands';
import commands from './commands';
import components from './components';
import interactionService from './services/interactionService';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', async () => {
  await registerCommands();
  console.log('Ready');
});

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    commands.get(interaction.commandName)?.handleAutocomplete(interaction)
      .catch(e => console.error('Couldn\'t handle autocomplete', e));
  } else if (interaction.isChatInputCommand()) {
    commands.get(interaction.commandName)?.handleChatInput(interaction)
      .catch(async e => {
        console.error('Couldn\'t handle chat input', e);
        await interactionService.replyWithError(e, interaction);
      });
  } else if (interaction.isSelectMenu()) {
    components.selectMenus.get(interaction.customId)?.handleInteraction(interaction)
      .catch(e => console.error('Couldn\'t handle select menu', e));
  } else if (interaction.isButton()) {
    components.buttons.get(interaction.customId)?.handleInteraction(interaction)
      .catch(e => console.error('Couldn\'t handle button', e));
  }
});

export default client;
