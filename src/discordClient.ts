import { Client, GatewayIntentBits } from 'discord.js';
import registerCommands from './commands/registerCommands';
import commands from './commands';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', async () => {
  await registerCommands();
  console.log('Ready');
});

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    const { commandName } = interaction;

    if (commandName === 'remind') {
      await commands.remind.handleAutocomplete(interaction);
    }

  } else if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'remind') {
      await commands.remind.handleChatInput(interaction);
    }
  }
});

export default client;
