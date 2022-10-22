import { faker } from '@faker-js/faker';
import { Collection, Message } from 'discord.js';
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
