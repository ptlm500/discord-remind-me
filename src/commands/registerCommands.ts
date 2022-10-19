import { REST, Routes } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN } from '../constants';
import commandMap from './index';
import { buildContextCommands } from './reminderContextMenu';

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const registerCommands = async () => {
  try {
    const builders = [
      ...Array.from(commandMap.values()).map(command => command.builder),
      ...buildContextCommands(),
    ];

    const commandsJSON = builders.map(command => command.toJSON());
    logger.notice('⌛ Registering global commands');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsJSON });
    logger.notice('✅ Registered global commands');
  } catch (e) {
    logger.error('❗ Unable to register global commands', e);
  }
};

export default registerCommands;
