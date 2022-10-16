import { ButtonBuilder, ButtonInteraction, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js';
import deleteReminder from './deleteReminder';
import snoozeReminder from './snoozeReminder';

type SelectMenu = {
  builder: SelectMenuBuilder,
  handleInteraction: (interaction: SelectMenuInteraction) => Promise<void>,
};

type Button = {
  builder: ButtonBuilder,
  handleInteraction: (interaction: ButtonInteraction) => Promise<void>,
};

const selectMenus: Map<string, SelectMenu> = new Map();

selectMenus.set('snoozeReminder', snoozeReminder);

const buttons: Map<string, Button> = new Map();

buttons.set('deleteReminder', deleteReminder);

export default {
  selectMenus,
  buttons,
};
