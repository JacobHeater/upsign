import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import { PrismaEventSegmentRepository } from '../../repositories/events/prisma-event-segment-repository';
import { PrismaEventRepository } from '../../repositories/events/prisma-event-repository';
import logger from '../../utils/logger';

const eventSegmentRepo = new PrismaEventSegmentRepository();
const eventRepo = new PrismaEventRepository();

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, eventId } = req.body;
    if (!name || !eventId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, eventId',
      };
      return res.status(400).json(response);
    }
    const event = await eventRepo.getByIdAsync(eventId);
    if (!event) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }
    if (event.hostId !== (req as any).user.userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Forbidden: Only event host can create segments',
      };
      return res.status(403).json(response);
    }
    const eventSegmentData = {
      id: '', // Will be generated
      name,
      eventId,
      event: {} as any, // Not needed for create
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const eventSegment = await eventSegmentRepo.createAsync(eventSegmentData);
    logger.info('Event segment created', {
      segmentId: eventSegment.id,
      eventId,
      userId: (req as any).user?.userId,
    });
    const response: IApiResponse<any> = {
      success: true,
      data: eventSegment,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event segment', error, { body: req.body });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event segment',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventSegment = await eventSegmentRepo.getByIdAsync(id);
    if (!eventSegment) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: eventSegment,
    };
    res.status(200).json(response);
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event segment',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (req, res) => {
  try {
    const eventSegments = await eventSegmentRepo.getAllAsync();
    const response: IApiResponse<any[]> = {
      success: true,
      data: eventSegments,
    };
    res.status(200).json(response);
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event segments',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, eventId } = req.body;
    if (!name || !eventId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, eventId',
      };
      return res.status(400).json(response);
    }
    const event = await eventRepo.getByIdAsync(eventId);
    if (!event) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }
    if (event.hostId !== (req as any).user.userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Forbidden: Only event host can update segments',
      };
      return res.status(403).json(response);
    }
    const eventSegmentData = {
      id,
      name,
      eventId,
      event: {} as any,
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const eventSegment = await eventSegmentRepo.updateAsync(id, eventSegmentData);
    if (!eventSegment) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment not found or update failed',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: eventSegment,
    };
    res.status(200).json(response);
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event segment',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingSegment = await eventSegmentRepo.getByIdAsync(id);
    if (!existingSegment) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment not found',
      };
      return res.status(404).json(response);
    }
    const event = await eventRepo.getByIdAsync(existingSegment.eventId);
    if (!event || event.hostId !== (req as any).user.userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Forbidden: Only event host can delete segments',
      };
      return res.status(403).json(response);
    }
    const success = await eventSegmentRepo.deleteAsync(id);
    if (!success) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event segment not found or delete failed',
      };
      return res.status(404).json(response);
    }
    res.status(204).send();
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event segment',
    };
    res.status(500).json(response);
  }
});

export default router;
