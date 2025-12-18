import { EventInvitation, RsvpStatus } from 'common/schema';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventInvitationRepository } from '../../repositories/events/prisma-event-invitation-repository';

const eventInvitationRepo = new PrismaEventInvitationRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event invitation', { user: (req as any).user });
  try {
    const { recipientId, message } = req.body;
    if (!recipientId || !message) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: recipientId, message',
      };
      return res.status(400).json(response);
    }
    const senderId = (req as any).user.userId;
    const invitationData: EventInvitation = {
      id: '', // Will be generated
      senderId,
      sender: { id: senderId } as any, // Not needed for create
      recipientId,
      recipient: { id: recipientId } as any, // Not needed for create
      message,
      viewed: false,
      rsvpStatus: RsvpStatus.Pending,
    };
    const invitation = await eventInvitationRepo.createAsync(invitationData);
    logger.info('Event invitation created', { invitationId: invitation.id, senderId, recipientId });
    const response: IApiResponse<any> = {
      success: true,
      data: invitation,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event invitation', error, {
      user: (req as any).user,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create event invitation',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await eventInvitationRepo.getByIdAsync(id);
    if (!invitation) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event invitation not found',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: invitation,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event invitation', error, { invitationId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event invitation',
    };
    res.status(500).json(response);
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { type } = req.query;

    let invitations: EventInvitation[];
    if (type === 'sent') {
      invitations = await eventInvitationRepo.getBySenderIdAsync(userId);
    } else if (type === 'received') {
      invitations = await eventInvitationRepo.getByRecipientIdAsync(userId);
    } else {
      // Get all invitations for the user (both sent and received)
      const [sent, received] = await Promise.all([
        eventInvitationRepo.getBySenderIdAsync(userId),
        eventInvitationRepo.getByRecipientIdAsync(userId),
      ]);
      invitations = [...sent, ...received];
    }

    const response: IApiResponse<any[]> = {
      success: true,
      data: invitations,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching event invitations', error, { user: (req as any).user });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to fetch event invitations',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, viewed, rsvpStatus } = req.body;

    // First get the existing invitation to preserve other fields
    const existingInvitation = await eventInvitationRepo.getByIdAsync(id);
    if (!existingInvitation) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event invitation not found',
      };
      return res.status(404).json(response);
    }

    // Check if user is authorized to update this invitation
    const userId = (req as any).user.userId;
    if (existingInvitation.senderId !== userId && existingInvitation.recipientId !== userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Unauthorized to update this invitation',
      };
      return res.status(403).json(response);
    }

    // Recipients can only update viewed and rsvpStatus, senders can update message
    const updateData: Partial<EventInvitation> = {};
    if (existingInvitation.senderId === userId && message !== undefined) {
      updateData.message = message;
    }
    if (existingInvitation.recipientId === userId) {
      if (viewed !== undefined) updateData.viewed = viewed;
      if (rsvpStatus !== undefined) updateData.rsvpStatus = rsvpStatus;
    }

    const invitationData: EventInvitation = {
      ...existingInvitation,
      ...updateData,
    };

    const invitation = await eventInvitationRepo.updateAsync(id, invitationData);
    if (!invitation) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event invitation not found or update failed',
      };
      return res.status(404).json(response);
    }
    const response: IApiResponse<any> = {
      success: true,
      data: invitation,
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event invitation', error, {
      invitationId: req.params.id,
      body: req.body,
    });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to update event invitation',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to delete this invitation
    const existingInvitation = await eventInvitationRepo.getByIdAsync(id);
    if (!existingInvitation) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event invitation not found',
      };
      return res.status(404).json(response);
    }

    const userId = (req as any).user.userId;
    if (existingInvitation.senderId !== userId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Only the sender can delete this invitation',
      };
      return res.status(403).json(response);
    }

    const success = await eventInvitationRepo.deleteAsync(id);
    if (!success) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Event invitation not found or delete failed',
      };
      return res.status(404).json(response);
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event invitation', error, { invitationId: req.params.id });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to delete event invitation',
    };
    res.status(500).json(response);
  }
});

export default router;
