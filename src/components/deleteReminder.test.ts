import deleteReminder from './deleteReminder';
import interactionService from '../services/interactionService';
import { ButtonInteractionBuilder } from '../../test/fixtures/discord';
jest.mock('../services/interactionService');

describe('deleteReminder', () => {
  it('exports a builder with the expected configuration', () => {
    expect(deleteReminder.builder.toJSON()).toMatchInlineSnapshot(`
    {
      "custom_id": "deleteReminder",
      "emoji": undefined,
      "label": "Delete",
      "style": 4,
      "type": 2,
    }
    `);
  });

  describe('handleInteraction', () => {
    it('calls deleteInteractionMessage to delete the interaction', async () => {
      const interaction = new ButtonInteractionBuilder().build();

      await deleteReminder.handleInteraction(interaction);

      expect(interactionService.deleteInteractionMessage).toHaveBeenCalledWith(interaction);
    });
  });
});
