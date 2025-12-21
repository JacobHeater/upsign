import { EventAttendee } from 'common';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventAttendeeRepository } from '../../repositories/events/prisma-event-attendee-repository';
import socketManager from '../../socket';

const eventAttendeeRepo = new PrismaEventAttendeeRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event attendee', { user: (req as any).user });
  try {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: userId, eventId',
      };
      return res.status(400).json(response);
    }
    const attendeeData: EventAttendee = {
      id: '', // Will be generated
      userId,
      eventId,
      user: {} as any, // Not needed for create
      event: {} as any, // Not needed for create
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const attendee = await eventAttendeeRepo.createAsync(attendeeData);
    logger.info('Event attendee created', {
      attendeeId: attendee.id,
      userId: (req as any).user.userId,
    });
    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event attendee', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event attendee',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendee = await eventAttendeeRepo.getByIdAsync(id);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event attendee', error, { attendeeId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event attendee',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (_, res) => {
  try {
    const attendees = await eventAttendeeRepo.getAllAsync();
    const response: IApiResponse<any[]> = {
      success: true,
      data: attendees,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event attendees', error);
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event attendees',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: userId, eventId',
      };
      return res.status(400).json(response);
    }
    const attendeeData: EventAttendee = {
      id,
      userId,
      eventId,
      user: {} as any,
      event: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const attendee = await eventAttendeeRepo.updateAsync(id, attendeeData);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee not found or update failed',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event attendee', error, {
      attendeeId: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event attendee',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the attendee exists
    const attendee = await eventAttendeeRepo.getByIdAsync(id);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee not found',
      };
      return res.status(404).json(response);
    }

    const success = await eventAttendeeRepo.deleteAsync(id);
    if (!success) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee not found or delete failed',
      };
      return res.status(404).json(response);
    }

    // Emit socket event for attendee removed
    socketManager.emitToAll('attendee-removed', {
      attendee: attendee,
      eventId: attendee.eventId,
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event attendee', error, { attendeeId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event attendee',
    };
    res.status(500).json(response);
  }
});

export default router;
