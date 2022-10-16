import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import registerCommands from './commands/registerCommands';
import commands from './commands';
import components from './components';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', async () => {
  await registerCommands();
  console.log('Ready');
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isAutocomplete()) {
      commands.get(interaction.commandName)?.handleAutocomplete(interaction);

    } else if (interaction.isChatInputCommand()) {
      commands.get(interaction.commandName)?.handleChatInput(interaction);
    } else if (interaction.isSelectMenu()) {
      components.selectMenus.get(interaction.customId)?.handleInteraction(interaction);
    }
  } catch (e) {
    console.error(e);
    await replyWithError(e as Error, interaction);
  }
});

const replyWithError = async (error: Error, interaction: Interaction) => {
  if (interaction.isRepliable()) {
    interaction.reply({ content: `❗ ${error.message}`, ephemeral: true });
  }
};

export default client;
