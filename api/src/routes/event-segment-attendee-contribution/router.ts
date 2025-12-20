import { EventSegmentAttendeeContribution } from 'common/schema';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventSegmentAttendeeContributionRepository } from '../../repositories/events/prisma-event-segment-attendee-contribution-repository';
import { PrismaEventSegmentAttendeeRepository } from '../../repositories/events/prisma-event-segment-attendee-repository';
import { PrismaEventSegmentRepository } from '../../repositories/events/prisma-event-segment-repository';
import socketManager from '../../socket';

const eventAttendeeContributionRepo = new PrismaEventSegmentAttendeeContributionRepository();
const eventSegmentAttendeeRepo = new PrismaEventSegmentAttendeeRepository();
const eventSegmentRepo = new PrismaEventSegmentRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event attendee contribution', { user: (req as any).user });
  try {
    const { item, description, quantity, eventSegmentAttendeeId } = req.body;
    if (!item || !description || quantity === undefined || !eventSegmentAttendeeId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: item, description, quantity, eventSegmentAttendeeId',
      };
      return res.status(400).json(response);
    }
    const contributionData: EventSegmentAttendeeContribution = {
      id: '', // Will be generated
      item,
      description,
      quantity,
      eventSegmentAttendeeId,
      eventSegmentAttendee: {} as any, // Not needed for create
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const contribution = await eventAttendeeContributionRepo.createAsync(contributionData);
    logger.info('Event attendee contribution created', {
      contributionId: contribution.id,
      userId: (req as any).user.userId,
    });

    // Emit socket event for contribution added
    const attendee = await eventSegmentAttendeeRepo.getByIdAsync(eventSegmentAttendeeId);
    if (attendee) {
      const segment = await eventSegmentRepo.getByIdAsync(attendee.segmentId);
      if (segment) {
        socketManager.emitToAll('contribution-added', {
          contribution: contribution,
          attendee: attendee,
          segment: segment,
          eventId: segment.eventId,
        });
      }
    }

    const response: IApiResponse<any> = {
      success: true,
      data: contribution,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event attendee contribution', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event attendee contribution',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contribution = await eventAttendeeContributionRepo.getByIdAsync(id);
    if (!contribution) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee contribution not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: contribution,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event attendee contribution', error, { id: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event attendee contribution',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (req, res) => {
  try {
    const contributions = await eventAttendeeContributionRepo.getAllAsync();
    const response: IApiResponse<any> = {
      success: true,
      data: contributions,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event attendee contributions', error);
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event attendee contributions',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  logger.debug('Updating event attendee contribution', {
    user: (req as any).user,
    id: req.params.id,
  });
  try {
    const { id } = req.params;
    const existing = await eventAttendeeContributionRepo.getByIdAsync(id);
    if (!existing) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee contribution not found',
      };
      return res.status(404).json(response);
    }
    const { eventSegmentAttendeeId, ...updateData } = req.body;
    const contributionData: EventSegmentAttendeeContribution = {
      ...existing,
      ...updateData,
      eventSegmentAttendeeId: eventSegmentAttendeeId || existing.eventSegmentAttendeeId,
    };
    const contribution = await eventAttendeeContributionRepo.updateAsync(id, contributionData);
    if (!contribution) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee contribution not found',
      };
      return res.status(404).json(response);
    }
    logger.info('Event attendee contribution updated', {
      contributionId: contribution.id,
      userId: (req as any).user.userId,
    });

    // Emit socket event for contribution updated
    const attendee = await eventSegmentAttendeeRepo.getByIdAsync(
      contribution.eventSegmentAttendeeId
    );
    if (attendee) {
      const segment = await eventSegmentRepo.getByIdAsync(attendee.segmentId);
      if (segment) {
        socketManager.emitToAll('contribution-updated', {
          contribution: contribution,
          attendee: attendee,
          segment: segment,
          eventId: segment.eventId,
        });
      }
    }

    const response: IApiResponse<any> = {
      success: true,
      data: contribution,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event attendee contribution', error, {
      user: (req as any).user,
      id: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event attendee contribution',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  logger.debug('Deleting event attendee contribution', {
    user: (req as any).user,
    id: req.params.id,
  });
  try {
    const { id } = req.params;

    // First get the contribution to check ownership
    const contribution = await eventAttendeeContributionRepo.getByIdAsync(id);
    if (!contribution) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event attendee contribution not found',
      };
      return res.status(404).json(response);
    }

    // Check if the user owns this contribution (through the attendee)
    if (contribution.eventSegmentAttendee.userId !== (req as any).user.userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'You can only delete your own contributions',
      };
      return res.status(403).json(response);
    }

    const deleted = await eventAttendeeContributionRepo.deleteAsync(id);
    if (!deleted) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Failed to delete event attendee contribution',
      };
      return res.status(500).json(response);
    }
    logger.info('Event attendee contribution deleted', {
      contributionId: id,
      userId: (req as any).user.userId,
    });

    // Emit socket event for contribution deleted
    const attendee = await eventSegmentAttendeeRepo.getByIdAsync(
      contribution.eventSegmentAttendeeId
    );
    if (attendee) {
      const segment = await eventSegmentRepo.getByIdAsync(attendee.segmentId);
      if (segment) {
        socketManager.emitToAll('contribution-deleted', {
          contribution: contribution,
          attendee: attendee,
          segment: segment,
          eventId: segment.eventId,
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event attendee contribution', error, {
      user: (req as any).user,
      id: req.params.id,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event attendee contribution',
    };
    res.status(500).json(response);
  }
});

export default router;
