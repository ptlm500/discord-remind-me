import { REST, Routes } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN } from '../constants';
import commandMap from './index';
import { buildContextCommands } from './reminderContextMenu';

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const registerCommands = async () => {
  const builders = [
    ...Array.from(commandMap.values()).map(command => command.builder),
    ...buildContextCommands(),
  ];

  const commandsJSON = builders.map(command => command.toJSON());

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsJSON });
  console.log('Registered slash commands');
};

export default registerCommands;
