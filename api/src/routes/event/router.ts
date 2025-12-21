import { Event } from 'common';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventRepository } from '../../repositories/events/prisma-event-repository';
import { PrismaEventInvitationRepository } from '../../repositories/events/prisma-event-invitation-repository';
import socketManager from '../../socket';

const eventRepo = new PrismaEventRepository();
const eventInvitationRepo = new PrismaEventInvitationRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event', { user: (req as any).user });
  try {
    const { name, description, date, location, icon } = req.body;
    if (!name || !description || !date || !location) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, date, location',
      };
      return res.status(400).json(response);
    }
    const hostId = (req as any).user.userId;
    const eventData: Event = {
      id: '', // Will be generated
      name,
      description,
      date: new Date(date),
      hostId,
      host: { id: hostId } as any, // Not needed for create
      location,
      icon: icon || '🎉',
      createdAt: new Date(),
      updatedAt: new Date(),
      segments: [],
      attendees: [],
    };
    const event = await eventRepo.createAsync(eventData);
    logger.info('Event created', { eventId: event.id, userId: (req as any).user.userId });
    const response: IApiResponse<any> = {
      success: true,
      data: event,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event', error, { user: (req as any).user, body: req.body });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const event = await eventRepo.getByIdAsync(id);
    if (!event) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }

    // Check permissions: user must be the host or have an accepted invitation
    if (userId) {
      const isHost = event.hostId === userId;
      if (!isHost) {
        // Check if user has an accepted invitation
        const invitations = await eventInvitationRepo.getByEventIdAsync(id);
        const hasInvitations = invitations.some((inv) => inv.recipientId === userId);
        const isUserAttendee = event.attendees?.some((att) => att.userId === userId);
        if (!hasInvitations && !isUserAttendee) {
          const response: IApiResponse<null> = {
            success: false,
            error: 'Event not found',
          };
          return res.status(404).json(response);
        }
      }
    } else {
      // No user logged in
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }

    const response: IApiResponse<any> = {
      success: true,
      data: event,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event', error, { eventId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const includePast = req.query.includePast === 'true' || req.query.past === 'true';

    let events = await eventRepo.getEventsForUserAsync(userId);

    // Filter out past events unless explicitly requested
    if (!includePast) {
      const now = new Date();
      events = events.filter((event) => new Date(event.date) >= now);
    }

    const response: IApiResponse<any[]> = {
      success: true,
      data: events,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching events', error);
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch events',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, location, icon, cancelled } = req.body;
    if (!name || !description || !date || !location) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, description, date, location',
      };
      return res.status(400).json(response);
    }
    const hostId = (req as any).user.userId;
    const eventData: Omit<Event, 'createdAt' | 'updatedAt' | 'segments' | 'attendees'> = {
      id,
      name,
      description,
      date: new Date(date),
      hostId,
      host: { id: hostId } as any,
      location,
      icon: icon || '🎉',
      cancelled: cancelled || false,
    };
    const event = await eventRepo.updateAsync(id, eventData);
    if (!event) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found or update failed',
      };
      return res.status(404).json(response);
    }

    // Emit socket event for event updated
    socketManager.emitToEvent(id, 'event-updated', event);

    const response: IApiResponse<any> = {
      success: true,
      data: event,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event', error, { eventId: req.params.id, body: req.body });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await eventRepo.deleteAsync(id);
    if (!success) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found or delete failed',
      };
      return res.status(404).json(response);
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event', error, { eventId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event',
    };
    res.status(500).json(response);
  }
});

export default router;
