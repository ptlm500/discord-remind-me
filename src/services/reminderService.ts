import reminderQueue from '../queue/reminderQueue';

type ReminderCreationOptions = {
  memberId: string;
  guildId: string;
  channelId: string;
  messageId: string;
  delay: number;
}

const createReminder = async (options: ReminderCreationOptions) => {
  try {
    const reminder = await reminderQueue.add(options, { delay: options.delay });
    console.log(`Reminder ${reminder.id} queued in ${options.delay}ms`);
  } catch {
    throw new Error('Something went wrong and I couldn\'t create the reminder');
  }
};

export default {
  createReminder,
};
