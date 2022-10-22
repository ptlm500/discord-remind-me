import { faker } from '@faker-js/faker';
import { ApplicationCommandType } from 'discord.js';
import { ContextMenuCommandInteractionBuilder } from '../../test/fixtures/discord';
import { buildContextCommands, handleContextMenu } from './reminderContextMenu';
import reminderService from '../services/reminderService';
jest.mock('../services/reminderService');

describe('reminderContextMenu', () => {
  const expectedCommands = [
    { name: 'Remind in 1 hour', delay: 3600000, humanizedDelay: 'in about 1 hour' },
    { name: 'Remind in 3 hours', delay: 10800000, humanizedDelay: 'in about 3 hours' },
    { name: 'Remind next morning', delay: 75600000, humanizedDelay: 'in about 21 hours' },
    { name: 'Remind next evening', delay: 111600000, humanizedDelay: 'in 1 day' },
  ];

  describe('buildContextCommands', () => {
    const commands = buildContextCommands();

    it('has the expected number of commands', () => {
      expect(commands.length).toBe(expectedCommands.length);
    });

    expectedCommands.forEach((expectedCommand, idx) => {
      it(`has a ${expectedCommand.name} command`, () => {
        expect(commands[idx].name).toBe(expectedCommand.name);
        expect(commands[idx].type).toBe(ApplicationCommandType.Message);
        expect(commands[idx].dm_permission).toBe(false);
      });
    });
  });

  describe('handleContextMenu', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date().setHours(12, 0, 0, 0));
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    const mockCreateReminder = jest.mocked(reminderService.createReminder)
      .mockReturnValue(Promise.resolve());

    expectedCommands.forEach(expectedCommand => {
      it(`creates a reminder for the ${expectedCommand.name} command`, async () => {
        const memberId = faker.datatype.uuid();
        const guildId = faker.datatype.uuid();
        const channelId = faker.datatype.uuid();
        const messageId = faker.datatype.uuid();
        const interaction = new ContextMenuCommandInteractionBuilder(expectedCommand.name)
          .calledBy(memberId)
          .calledOnMessage(guildId, channelId, messageId)
          .build();

        await handleContextMenu(interaction);

        expect(mockCreateReminder).toHaveBeenCalledWith({
          memberId,
          guildId,
          channelId,
          messageId,
          delay: expectedCommand.delay,
        });

        expect(interaction.reply).toHaveBeenCalledWith({
          content: `I'll remind you of [this message](https://discord.com/channels/${guildId}/${channelId}/${messageId}) ${expectedCommand.humanizedDelay}`,
          ephemeral: true,
        });
      });

      it('throws an error when the command doesn\'t contain message details', async () => {
        const memberId = faker.datatype.uuid();
        const interaction = new ContextMenuCommandInteractionBuilder(expectedCommand.name)
          .calledBy(memberId)
          .build();

        await expect(handleContextMenu(interaction))
          .rejects
          .toThrow('Not a valid command.');

        expect(mockCreateReminder).not.toHaveBeenCalled();
      });
    });
  });
});

