import { REST, Routes } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from '../constants';
import commandMap from './index';

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const registerCommands = async () => {
  const builders = Object.values(commandMap).map(command => command.builder);

  const commands = builders.map(command => command.toJSON());

  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log('Registered slash commands');
};

export default registerCommands;
