import { EventSegmentAttendee } from 'common';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventSegmentAttendeeRepository } from '../../repositories/events/prisma-event-segment-attendee-repository';
import { PrismaEventSegmentRepository } from '../../repositories/events/prisma-event-segment-repository';
import socketManager from '../../socket';
import { PrismaEventRepository } from '../../repositories/events/prisma-event-repository';

const eventSegmentAttendeeRepo = new PrismaEventSegmentAttendeeRepository();
const eventSegmentRepo = new PrismaEventSegmentRepository();
const eventRepo = new PrismaEventRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event segment attendee', { user: (req as any).user });
  try {
    const { userId, segmentId } = req.body;
    if (!userId || !segmentId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: userId, segmentId',
      };
      return res.status(400).json(response);
    }
    const attendeeData: EventSegmentAttendee = {
      id: '', // Will be generated
      userId,
      segmentId,
      user: {} as any, // Not needed for create
      segment: {} as any, // Not needed for create
      contributions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const attendee = await eventSegmentAttendeeRepo.createAsync(attendeeData);
    logger.info('Event segment attendee created', {
      attendeeId: attendee.id,
      userId: (req as any).user.userId,
    });

    // Emit socket event for attendee added
    const segment = await eventSegmentRepo.getByIdAsync(segmentId);
    if (segment) {
      socketManager.emitToAll('attendee-added', {
        attendee: attendee,
        segment: segment,
        eventId: segment.eventId,
      });
    }

    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event segment attendee', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event segment attendee',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendee = await eventSegmentAttendeeRepo.getByIdAsync(id);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment attendee not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event segment attendee', error, { attendeeId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event segment attendee',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (_, res) => {
  try {
    const attendees = await eventSegmentAttendeeRepo.getAllAsync();
    const response: IApiResponse<any[]> = {
      success: true,
      data: attendees,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event segment attendees', error);
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event segment attendees',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, segmentId } = req.body;
    if (!userId || !segmentId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: userId, segmentId',
      };
      return res.status(400).json(response);
    }
    const attendeeData: EventSegmentAttendee = {
      id,
      userId,
      segmentId,
      user: {} as any,
      segment: {} as any,
      contributions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const attendee = await eventSegmentAttendeeRepo.updateAsync(id, attendeeData);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment attendee not found or update failed',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: attendee,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event segment attendee', error, {
      attendeeId: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event segment attendee',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  logger.debug('Deleting event segment attendee', { user: (req as any).user });
  try {
    const { id } = req.params;

    // First check if the attendee exists and belongs to the current user
    const attendee = await eventSegmentAttendeeRepo.getByIdAsync(id);
    if (!attendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment attendee not found',
      };
      return res.status(404).json(response);
    }

    const event = await eventRepo.getByIdAsync(attendee.segment.eventId);
    const isHost = event?.hostId === (req as any).user.userId;

    // Check if the current user is the attendee
    if (!isHost && attendee.userId !== (req as any).user.userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'You can only leave segments you are attending',
      };
      return res.status(403).json(response);
    }

    const success = await eventSegmentAttendeeRepo.deleteAsync(id);
    if (!success) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment attendee not found or delete failed',
      };
      return res.status(404).json(response);
    }

    // Emit socket event for attendee left
    const segment = await eventSegmentRepo.getByIdAsync(attendee.segmentId);
    if (segment) {
      socketManager.emitToAll('segment-attendee-left', {
        attendee: attendee,
        segment: segment,
        eventId: segment.eventId,
      });
    }

    logger.info('Event segment attendee deleted (user left segment)', {
      attendeeId: id,
      userId: (req as any).user.userId,
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event segment attendee', error, { attendeeId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event segment attendee',
    };
    res.status(500).json(response);
  }
});

export default router;
