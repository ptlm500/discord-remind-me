import remind from './remind';
import { AutocompleteInteraction, AutocompleteFocusedOption, Collection, Message } from 'discord.js';
import { faker } from '@faker-js/faker';
import { discord } from '../../test/fixtures';

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
    const mockFetchMessages = jest.fn();
    const mockRespond = jest.fn();
    const mockGetFocused = jest.fn(() => ({
      name: 'message',
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

    it('calls mockFetchMessage and returns when no messages are returned', async () => {
      await remind.handleAutocomplete(interaction);
      expect(mockFetchMessages).toHaveBeenCalledWith({ limit: 50 });
      expect(mockRespond).not.toHaveBeenCalled();
    });

    const convertMessageToExpectedResponse = (message: Message<boolean>) => ({
      sender: message.author.username,
      content: message.cleanContent,
      name: `${message.author.username.substring(0, 15)}: ${message.cleanContent.substring(0, 80)}`,
      value: `${interaction.user.id},${message.guildId},${message.channelId},${message.id}`,
    });

    it('responds with message choices when messages are returned', async () => {
      const messageCollection = discord.generateMessageCollection();

      mockFetchMessages.mockReturnValue(messageCollection);
      await remind.handleAutocomplete(interaction);

      const expectedResponse = messageCollection.map(convertMessageToExpectedResponse);

      expect(mockRespond).toHaveBeenCalledWith(expectedResponse);
    });

    it('responds with up to 24 message choices', async () => {
      const messageCollection = discord.generateMessageCollection(50);

      mockFetchMessages.mockReturnValue(messageCollection);
      await remind.handleAutocomplete(interaction);

      const expectedResponse = messageCollection.map(convertMessageToExpectedResponse).slice(0, 24);

      expect(mockRespond).toHaveBeenCalledWith(expectedResponse);
    });

    it('filters the message choices based on message content', async () => {
      const option = {
        name: 'message',
        value: faker.datatype.uuid(),
      } as AutocompleteFocusedOption;
      mockGetFocused.mockReturnValue(option);
      const message = { cleanContent: option.value } as Message<boolean>;
      const messagesMatchingValue = discord.generateMessage.many(10, message);
      const messagesNotMatchingValue = discord.generateMessage.many(10);
      const messageCollection = discord.buildCollection([...messagesMatchingValue, ...messagesNotMatchingValue]);

      mockFetchMessages.mockReturnValue(messageCollection);
      await remind.handleAutocomplete(interaction);

      const expectedResponse = messagesMatchingValue.map(convertMessageToExpectedResponse);

      expect(mockRespond).toHaveBeenCalledWith(expectedResponse);
    });

    it('filters the message choices based on message sender', async () => {
      const option = {
        name: 'message',
        value: faker.datatype.uuid(),
      } as AutocompleteFocusedOption;
      mockGetFocused.mockReturnValue(option);
      const message = { author: { username: option.value } } as Message<boolean>;
      const messagesMatchingValue = discord.generateMessage.many(10, message);
      const messagesNotMatchingValue = discord.generateMessage.many(10);
      const messageCollection = discord.buildCollection([...messagesMatchingValue, ...messagesNotMatchingValue]);

      mockFetchMessages.mockReturnValue(messageCollection);
      await remind.handleAutocomplete(interaction);

      const expectedResponse = messagesMatchingValue.map(convertMessageToExpectedResponse);

      expect(mockRespond).toHaveBeenCalledWith(expectedResponse);
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
});