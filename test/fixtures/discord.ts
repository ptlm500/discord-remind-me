import { faker } from '@faker-js/faker';
import { AutocompleteInteraction, ChatInputCommandInteraction, Collection, Message, MessageContextMenuCommandInteraction } from 'discord.js';
import wrapWithMany from './wrapWithMany';

export const buildCollection = <R>(list: R[]) : Collection<string, R> => {
  const elements: Iterable<[string, R]> = list.map(el => ([faker.datatype.string(), el]));
  return new Collection(elements);
};

export const generateMessage = wrapWithMany<Message<boolean>>(message => ({
  cleanContent: faker.lorem.paragraph(),
  author: {
    username: faker.internet.userName(),
  },
  guildId: faker.datatype.uuid(),
  channelId: faker.datatype.uuid(),
  id: faker.datatype.uuid(),
  ...message,
} as Message));

export const generateMessageCollection = (number = 10, message?: Partial<Message<boolean>> | undefined) =>
  buildCollection(generateMessage.many(number, message));

export class ChatInputInteractionBuilder {
  private readonly options: Record<string, string>;
  private readonly interaction: ChatInputCommandInteraction;

  constructor() {
    this.options = {};
    this.interaction = {
      user: {
        id: faker.datatype.uuid(),
      },
      options: {
        getString: (optionName: string) => this.options[optionName],
      },
      channel: {
        messages: {
          fetch: jest.fn(),
        },
      },
      reply: jest.fn(),
    } as unknown as ChatInputCommandInteraction;
  }

  public withOption(name: string, value: string) {
    this.options[name] = value;
    return this;
  }

  public build() {
    return this.interaction;
  }
}

export class AutocompleteInteractionBuilder {
  private readonly interaction: AutocompleteInteraction;
  private messages: Collection<string, Message<boolean>>;

  constructor(focusedValue: { name: string, value: string }) {
    this.messages = new Collection();
    this.interaction = {
      user: {
        id: faker.datatype.uuid(),
      },
      options: {
        getFocused: () => focusedValue,
      },
      channel: {
        messages: {
          fetch: jest.fn(async () => this.messages),
        },
      },
      respond: jest.fn(),
    } as unknown as AutocompleteInteraction;
  }

  public withChannelMessages(messages: Collection<string, Message<boolean>>) {
    this.messages = messages;
    return this;
  }

  public build() {
    return this.interaction;
  }
}

export class ContextMenuCommandInteractionBuilder {
  private readonly interaction: MessageContextMenuCommandInteraction;

  constructor(commandName: string) {
    this.interaction = {
      user: {},
      targetMessage: {},
      commandName,
      reply: jest.fn(),
    } as unknown as MessageContextMenuCommandInteraction;
  }

  public calledBy(userId: string) {
    this.interaction.user.id = userId;
    return this;
  }

  public calledOnMessage(guildId: string, channelId: string, messageId: string) {
    this.interaction.targetMessage.guildId = guildId;
    this.interaction.targetMessage.channelId = channelId;
    this.interaction.targetMessage.id = messageId;
    return this;
  }

  public build() {
    return this.interaction;
  }
}
