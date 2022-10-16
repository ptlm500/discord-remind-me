import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import remind from './remind';

type Command = {
  builder: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>,
  handleAutocomplete: (interaction: AutocompleteInteraction) => Promise<void>,
  handleChatInput: (interaction: ChatInputCommandInteraction) => Promise<void>
};

const commandMap: Map<string, Command> = new Map();
commandMap.set('remind', remind);

export default commandMap;
