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
      const { commandName } = interaction;

      if (commandName === 'remind') {
        await commands.remind.handleAutocomplete(interaction);
      }

    } else if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      if (commandName === 'remind') {
        await commands.remind.handleChatInput(interaction);
      }
    } else if (interaction.isSelectMenu()) {
      if (interaction.customId === 'snoozeReminder') {
        components.snoozeReminder.handleInteraction(interaction);
      }
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
