import remind from './remind';
import { AutocompleteInteraction, AutocompleteFocusedOption, Message } from 'discord.js';
import { faker } from '@faker-js/faker';
import { discord } from '../../test/fixtures';
import reminderService from '../services/reminderService';
import { checkMessageExists } from '../discordClient/message';
import { AutocompleteInteractionBuilder, ChatInputInteractionBuilder } from '../../test/fixtures/discord';
jest.mock('../services/reminderService');
jest.mock('../discordClient/message');

describe('remind', () => {
  it('exports a builder with the expected configuration', () => {
    expect(remind.builder.name).toBe('remind');
    expect(remind.builder.description).toBe('Remind you of a message');
    expect(remind.builder.options.length).toBe(2);
    // Message option
    expect(remind.builder.options[0].toJSON()).toMatchInlineSnapshot(`
    {
      "autocomplete": true,
      "choices": undefined,
      "description": "Select the message to remind you of",
      "description_localizations": undefined,
      "max_length": undefined,
      "min_length": undefined,
      "name": "message",
      "name_localizations": undefined,
      "required": true,
      "type": 3,
    }
    `);
    // time option
    expect(remind.builder.options[1].toJSON()).toMatchInlineSnapshot(`
    {
      "autocomplete": true,
      "choices": undefined,
      "description": "When should I remind you about this message?",
      "description_localizations": undefined,
      "max_length": undefined,
      "min_length": undefined,
      "name": "when",
      "name_localizations": undefined,
      "required": true,
      "type": 3,
    }
    `);
  });

  describe('handleAutocomplete for the message option', () => {
    it('calls mockFetchMessage and returns when no messages are returned', async () => {
      const interaction = new AutocompleteInteractionBuilder({ name: 'message', value: '' })
        .build();
      await remind.handleAutocomplete(interaction);
      expect(interaction.channel?.messages.fetch).toHaveBeenCalledWith({ limit: 50 });
      expect(interaction.respond).not.toHaveBeenCalled();
    });

    const convertMessageToExpectedResponse = (userId: string, message: Message<boolean>) => ({
      sender: message.author.username,
      content: message.cleanContent,
      name: `${message.author.username.substring(0, 15)}: ${message.cleanContent.substring(0, 80)}`,
      value: `${userId},${message.guildId},${message.channelId},${message.id}`,
    });

    it('responds with message choices when messages are returned', async () => {
      const messageCollection = discord.generateMessageCollection();
      const interaction = new AutocompleteInteractionBuilder({ name: 'message', value: '' })
        .withChannelMessages(messageCollection)
        .build();

      await remind.handleAutocomplete(interaction);

      const expectedResponse = messageCollection
        .map(message => convertMessageToExpectedResponse(interaction.user.id, message));

      expect(interaction.respond).toHaveBeenCalledWith(expectedResponse);
    });

    it('responds with up to 24 message choices', async () => {
      const messageCollection = discord.generateMessageCollection(50);
      const interaction = new AutocompleteInteractionBuilder({ name: 'message', value: '' })
        .withChannelMessages(messageCollection)
        .build();

      await remind.handleAutocomplete(interaction);

      const expectedResponse = messageCollection
        .map(message => convertMessageToExpectedResponse(interaction.user.id, message))
        .slice(0, 24);

      expect(interaction.respond).toHaveBeenCalledWith(expectedResponse);
    });

    it('filters the message choices based on message content', async () => {
      const messageOptionValue = faker.datatype.uuid();
      const messagesMatchingValue = discord.generateMessage.many(10, { cleanContent: messageOptionValue } as Message<boolean>);
      const messagesNotMatchingValue = discord.generateMessage.many(10);
      const messageCollection = discord.buildCollection([...messagesMatchingValue, ...messagesNotMatchingValue]);
      const interaction = new AutocompleteInteractionBuilder({ name: 'message', value: messageOptionValue })
        .withChannelMessages(messageCollection)
        .build();

      await remind.handleAutocomplete(interaction);

      const expectedResponse = messagesMatchingValue
        .map(message => convertMessageToExpectedResponse(interaction.user.id, message));

      expect(interaction.respond).toHaveBeenCalledWith(expectedResponse);
    });

    it('filters the message choices based on message sender', async () => {
      const messageOptionValue = faker.datatype.uuid();
      const messagesMatchingValue = discord.generateMessage.many(10, { author: { username: messageOptionValue } } as Message<boolean>);
      const messagesNotMatchingValue = discord.generateMessage.many(10);
      const messageCollection = discord.buildCollection([...messagesMatchingValue, ...messagesNotMatchingValue]);
      const interaction = new AutocompleteInteractionBuilder({ name: 'message', value: messageOptionValue })
        .withChannelMessages(messageCollection)
        .build();

      await remind.handleAutocomplete(interaction);

      const expectedResponse = messagesMatchingValue
        .map(message => convertMessageToExpectedResponse(interaction.user.id, message));

      expect(interaction.respond).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('handleAutocomplete for the when option', () => {
    const mockFetchMessages = jest.fn();
    const mockRespond = jest.fn();
    const mockGetFocused = jest.fn(() => ({
      name: 'when',
      value: '',
    } as AutocompleteFocusedOption));
    const interaction = {
      user: {
        id: faker.datatype.uuid(),
      },
      options: {
        getFocused: mockGetFocused,
      },
      channel: {
        messages: {
          fetch: mockFetchMessages,
        },
      },
      respond: mockRespond,
    } as unknown as AutocompleteInteraction;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns valid time options as choices', async () => {
      const option = {
        name: 'when',
        value: 'in 2 sec',
      } as AutocompleteFocusedOption;
      mockGetFocused.mockReturnValue(option);

      await remind.handleAutocomplete(interaction);
      expect(mockRespond).toHaveBeenCalledWith([{
        name: 'in 2 sec',
        value: 'in 2 sec',
      }]);
    });

    it('doesn\'t return invalid time options as choices', async () => {
      const option = {
        name: 'when',
        value: faker.lorem.words(),
      } as AutocompleteFocusedOption;
      mockGetFocused.mockReturnValue(option);

      await remind.handleAutocomplete(interaction);
      expect(mockRespond).toHaveBeenCalledWith([]);
    });
  });

  describe('handleChatInput', () => {
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

    const memberId = faker.datatype.uuid();
    const guildId = faker.datatype.uuid();
    const channelId = faker.datatype.uuid();
    const messageId = faker.datatype.uuid();

    it('creates a reminder and replies with confirmation', async () => {
      const interaction = new ChatInputInteractionBuilder()
        .withOption('message', `${memberId},${guildId},${channelId},${messageId}`)
        .withOption('when', 'in 1 sec')
        .build();

      jest.mocked(checkMessageExists).mockImplementation(async () => true);
      await remind.handleChatInput(interaction);

      expect(checkMessageExists).toHaveBeenCalledWith({ memberId, guildId, channelId, messageId });

      expect(mockCreateReminder).toHaveBeenCalledWith({
        memberId,
        guildId,
        channelId,
        messageId,
        delay: 1000,
      });

      expect(interaction.reply).toHaveBeenCalledWith({
        content: `I'll remind you of [this message](https://discord.com/channels/${guildId}/${channelId}/${messageId}) in less than a minute`,
        ephemeral: true,
      });
    });

    it('throws an error and doesn\'t create a reminder for times in the past', async () => {
      const interaction = new ChatInputInteractionBuilder()
        .withOption('message', `${memberId},${guildId},${channelId},${messageId}`)
        .withOption('when', 'yesterday')
        .build();

      jest.mocked(checkMessageExists).mockImplementation(async () => true);

      await expect(remind.handleChatInput(interaction))
        .rejects
        .toThrow('You can\'t remind your past self.');

      expect(mockCreateReminder).not.toHaveBeenCalled();
    });

    it('throws an error for reminders over the maximum delay', async () => {
      const interaction = new ChatInputInteractionBuilder()
        .withOption('message', `${memberId},${guildId},${channelId},${messageId}`)
        .withOption('when', 'in 2 sec')
        .build();

      jest.mocked(checkMessageExists).mockImplementation(async () => true);

      await expect(remind.handleChatInput(interaction))
        .rejects
        .toThrow('You can\'t set reminders over less than a minute away.');

      expect(mockCreateReminder).not.toHaveBeenCalled();
    });

    it('throws an error when the message can\'t be found', async () => {
      const interaction = new ChatInputInteractionBuilder()
        .withOption('message', `${memberId},${guildId},${channelId},${messageId}`)
        .withOption('when', 'in 1 sec')
        .build();

      jest.mocked(checkMessageExists).mockImplementation(async () => { throw new Error(); });

      await expect(remind.handleChatInput(interaction))
        .rejects
        .toThrow('I couldn\' find that message');

      expect(mockCreateReminder).not.toHaveBeenCalled();
    });
  });
});