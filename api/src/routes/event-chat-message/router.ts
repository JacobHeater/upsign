import { EventChatMessage } from 'common';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventChatMessageRepository } from '../../repositories/events/prisma-event-chat-message-repository';

const messageRepo = new PrismaEventChatMessageRepository();
const router = Router();

router.get('/', async (req, res) => {
  logger.debug('Getting event chat messages', { user: (req as any).user });
  try {
    const { eventId } = req.query;
    if (!eventId || typeof eventId !== 'string') {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing or invalid eventId query parameter',
      };
      return res.status(400).json(response);
    }
    const messages = await messageRepo.getByEventIdAsync(eventId);
    const response: IApiResponse<EventChatMessage[]> = {
      success: true,
      data: messages,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting event chat messages', error, {
      user: (req as any).user,
      query: req.query,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to get event chat messages',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  logger.debug('Getting event chat message by id', { user: (req as any).user, id: req.params.id });
  try {
    const message = await messageRepo.getByIdAsync(req.params.id);
    if (!message) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<EventChatMessage> = {
      success: true,
      data: message,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting event chat message', error, {
      user: (req as any).user,
      id: req.params.id,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to get event chat message',
    };
    res.status(500).json(response);
  }
});

router.post('/', async (req, res) => {
  logger.debug('Creating event chat message', { user: (req as any).user });
  try {
    const { eventId, message } = req.body;
    if (!eventId || !message) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: eventId, message',
      };
      return res.status(400).json(response);
    }
    const userId = (req as any).user.userId;
    const messageData: EventChatMessage = {
      id: '',
      userId,
      user: { id: userId } as any,
      eventId,
      event: { id: eventId } as any,
      message,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createdMessage = await messageRepo.createAsync(messageData);
    logger.info('Event chat message created', { messageId: createdMessage.id, userId });
    const response: IApiResponse<EventChatMessage> = {
      success: true,
      data: createdMessage,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event chat message', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event chat message',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  logger.debug('Updating event chat message', { user: (req as any).user, id: req.params.id });
  try {
    const { message } = req.body;
    if (!message) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required field: message',
      };
      return res.status(400).json(response);
    }
    const existingMessage = await messageRepo.getByIdAsync(req.params.id);
    if (!existingMessage) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message not found',
      };
      return res.status(404).json(response);
    }
    const updatedData: EventChatMessage = {
      ...existingMessage,
      message,
      updatedAt: new Date(),
    };
    const updatedMessage = await messageRepo.updateAsync(req.params.id, updatedData);
    if (!updatedMessage) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Failed to update event chat message',
      };
      return res.status(500).json(response);
    }
    const response: IApiResponse<EventChatMessage> = {
      success: true,
      data: updatedMessage,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event chat message', error, {
      user: (req as any).user,
      id: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event chat message',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  logger.debug('Deleting event chat message', { user: (req as any).user, id: req.params.id });
  try {
    const deleted = await messageRepo.deleteAsync(req.params.id);
    if (!deleted) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event chat message not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<null> = {
      success: true,
      data: null,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deleting event chat message', error, {
      user: (req as any).user,
      id: req.params.id,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event chat message',
    };
    res.status(500).json(response);
  }
});

export default router;
