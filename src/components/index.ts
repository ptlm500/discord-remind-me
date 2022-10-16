import { SelectMenuBuilder, SelectMenuInteraction } from 'discord.js';
import snoozeReminder from './snoozeReminder';

type SelectMenu = {
  builder: SelectMenuBuilder,
  handleInteraction: (interaction: SelectMenuInteraction) => Promise<void>,
};

const selectMenus: Map<string, SelectMenu> = new Map();

selectMenus.set('snoozeReminder', snoozeReminder);

export default {
  selectMenus,
};
