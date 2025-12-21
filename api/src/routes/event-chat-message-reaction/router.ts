import { EventChatMessageReaction } from 'common';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventChatMessageReactionRepository } from '../../repositories/events/prisma-event-chat-message-reaction-repository';

const reactionRepo = new PrismaEventChatMessageReactionRepository();
const router = Router();

router.get('/', async (req, res) => {
  logger.debug('Getting event chat message reactions', { user: (req as any).user });
  try {
    const { messageId } = req.query;
    if (!messageId || typeof messageId !== 'string') {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing or invalid messageId query parameter',
      };
      return res.status(400).json(response);
    }
    const reactions = await reactionRepo.getByMessageIdAsync(messageId);
    const response: IApiResponse<EventChatMessageReaction[]> = {
      success: true,
      data: reactions,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting event chat message reactions', error, {
      user: (req as any).user,
      query: req.query,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to get event chat message reactions',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  logger.debug('Getting event chat message reaction by id', {
    user: (req as any).user,
    id: req.params.id,
  });
  try {
    const reaction = await reactionRepo.getByIdAsync(req.params.id);
    if (!reaction) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message reaction not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<EventChatMessageReaction> = {
      success: true,
      data: reaction,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting event chat message reaction', error, {
      user: (req as any).user,
      id: req.params.id,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to get event chat message reaction',
    };
    res.status(500).json(response);
  }
});

router.post('/', async (req, res) => {
  logger.debug('Creating event chat message reaction', { user: (req as any).user });
  try {
    const { messageId, reaction } = req.body;
    if (!messageId || !reaction) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: messageId, reaction',
      };
      return res.status(400).json(response);
    }
    const userId = (req as any).user.userId;
    const reactionData: EventChatMessageReaction = {
      id: '',
      messageId,
      message: { id: messageId } as any,
      userId,
      user: { id: userId } as any,
      reaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createdReaction = await reactionRepo.createAsync(reactionData);
    logger.info('Event chat message reaction created', { reactionId: createdReaction.id, userId });
    const response: IApiResponse<EventChatMessageReaction> = {
      success: true,
      data: createdReaction,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event chat message reaction', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event chat message reaction',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  logger.debug('Updating event chat message reaction', {
    user: (req as any).user,
    id: req.params.id,
  });
  try {
    const { reaction } = req.body;
    if (!reaction) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required field: reaction',
      };
      return res.status(400).json(response);
    }
    const existingReaction = await reactionRepo.getByIdAsync(req.params.id);
    if (!existingReaction) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message reaction not found',
      };
      return res.status(404).json(response);
    }
    const updatedData: EventChatMessageReaction = {
      ...existingReaction,
      reaction,
      updatedAt: new Date(),
    };
    const updatedReaction = await reactionRepo.updateAsync(req.params.id, updatedData);
    if (!updatedReaction) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Failed to update event chat message reaction',
      };
      return res.status(500).json(response);
    }
    const response: IApiResponse<EventChatMessageReaction> = {
      success: true,
      data: updatedReaction,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event chat message reaction', error, {
      user: (req as any).user,
      id: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event chat message reaction',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  logger.debug('Deleting event chat message reaction', {
    user: (req as any).user,
    id: req.params.id,
  });
  try {
    const deleted = await reactionRepo.deleteAsync(req.params.id);
    if (!deleted) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message reaction not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<null> = {
      success: true,
      data: null,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deleting event chat message reaction', error, {
      user: (req as any).user,
      id: req.params.id,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event chat message reaction',
    };
    res.status(500).json(response);
  }
});

export default router;
