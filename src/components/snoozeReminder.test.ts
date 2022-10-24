import { faker } from '@faker-js/faker';
import { generateDiscordMessageUrl, SelectMenuInteractionBuilder } from '../../test/fixtures/discord';
import snoozeReminder from './snoozeReminder';
import reminderService from '../services/reminderService';
import interactionService from '../services/interactionService';
jest.mock('../services/reminderService');
jest.mock('../services/interactionService');
jest.mock('../utils/date', () => {
  const original = jest.requireActual('../utils/date');

  return {
    __esModule: true,
    ...original,
    getMsUntilTomorrowAt: (hour: number) => hour,
  };
});

describe('snoozeReminder', () => {
  const expectedOptions = [
    {
      label: '5 minutes',
      description: 'Remind you of this message again in 5 minutes',
      value: '300000',
    },
    {
      label: '1 hour',
      description: 'Remind you of this message again in an hour',
      value: '3600000',
    },
    {
      label: 'Tomorrow morning',
      description: 'Remind you of this message again tomorrow at 9:00 AM',
      value: '9',
    },
    {
      label: 'Tomorrow evening',
      description: 'Remind you of this message again tomorrow at 7:00 PM',
      value: '19',
    },
  ];

  it('exports a builder with the expected number of options', () => {
    expect(snoozeReminder.builder.options.length).toBe(expectedOptions.length);
  });

  expectedOptions.forEach((expectedOption, idx) => {
    it(`has a ${expectedOption.label} option`, () => {
      expect(snoozeReminder.builder.options[idx].data.label).toBe(expectedOption.label);
      expect(snoozeReminder.builder.options[idx].data.description).toBe(expectedOption.description);
      expect(snoozeReminder.builder.options[idx].data.value).toBe(expectedOption.value);
      expect(snoozeReminder.builder.options[idx].data.emoji).toBeUndefined();
      expect(snoozeReminder.builder.options[idx].data.default).toBeFalsy();
    });
  });

  describe('handleInteraction', () => {
    const mockCreateReminder = jest.mocked(reminderService.createReminder)
      .mockReturnValue(Promise.resolve());

    const now = new Date();
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    const guildId = faker.datatype.uuid();
    const channelId = faker.datatype.uuid();
    const messageId = faker.datatype.uuid();

    it('creates a reminder, replies with a self deleting message and deletes the original interaction', async () => {
      const delay = 1000;
      const interaction = new SelectMenuInteractionBuilder()
        .forEmbed({ url: generateDiscordMessageUrl({ guildId, channelId, messageId }) })
        .withValue(delay.toString())
        .build();

      await snoozeReminder.handleInteraction(interaction);

      expect(mockCreateReminder).toHaveBeenCalledWith({
        memberId: interaction.user.id,
        guildId,
        channelId,
        messageId,
        delay,
      });

      expect(interactionService.replyWithSelfDeletingMessage)
        .toHaveBeenCalledWith(interaction, 'Snoozed for less than a minute');
      expect(interactionService.deleteInteractionMessage).toHaveBeenCalledWith(interaction);
    });

    it('throws an error when the attached embed doesn\'t have a url', async () => {
      const delay = 1000;
      const interaction = new SelectMenuInteractionBuilder()
        .forEmbed({})
        .withValue(delay.toString())
        .build();

      await expect(snoozeReminder.handleInteraction(interaction))
        .rejects
        .toThrow('Original message embed has no URL');
    });

    it('throws an error when the delay value is not a number', async () => {
      const delay = faker.datatype.string();
      const interaction = new SelectMenuInteractionBuilder()
        .forEmbed({ url: generateDiscordMessageUrl({ guildId, channelId, messageId }) })
        .withValue(delay.toString())
        .build();

      await expect(snoozeReminder.handleInteraction(interaction))
        .rejects
        .toThrow(`Couldn't parse, "${delay}"`);
    });
  });
});
