import { EventInvitation, EventAttendee } from 'common/schema';
import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import logger from '../../utils/logger';
import { PrismaEventInvitationRepository } from '../../repositories/events/prisma-event-invitation-repository';
import { PrismaUserRepository } from '../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../repositories/events/prisma-event-repository';
import socketManager from '../../socket';
import { PrismaEventAttendeeRepository } from '../../repositories/events/prisma-event-attendee-repository';

const eventInvitationRepo = new PrismaEventInvitationRepository();
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const eventAttendeeRepo = new PrismaEventAttendeeRepository();
const router = Router();

router.post('/', async (req, res) => {
  logger.debug('Creating event invitation', { user: (req as any).user });
  try {
    const { phoneNumber, message, eventId } = req.body;
    if (!phoneNumber || !message || !eventId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Missing required fields: phoneNumber, message, eventId',
      };
      return res.status(400).json(response);
    }
    const senderId = (req as any).user.userId;

    // Look up recipient by phone number
    const recipient = await userRepo.getByPhoneNumberAsync(phoneNumber);
    if (!recipient) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'User not found with this phone number',
      };
      return res.status(404).json(response);
    }

    // Prevent self-invitation
    if (recipient.id === senderId) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'You cannot invite yourself to an event',
      };
      return res.status(400).json(response);
    }

    // Check if recipient already has a pending invitation for this event
    const existingInvitations = await eventInvitationRepo.getByEventIdAsync(eventId);
    const pendingInvitation = existingInvitations.find(
      (inv) => inv.recipientId === recipient.id && inv.rsvpStatus === 'Pending'
    );
    if (pendingInvitation) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'This user already has a pending invitation to this event',
      };
      return res.status(400).json(response);
    }

    // Check if recipient is already an attendee of this event
    const existingAttendee = await eventAttendeeRepo.getByUserIdAndEventIdAsync(
      recipient.id,
      eventId
    );
    if (existingAttendee) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'This user is already attending this event',
      };
      return res.status(400).json(response);
    }

    const invitationData: EventInvitation = {
      id: '', // Will be generated
      senderId,
      sender: { id: senderId } as any, // Not needed for create
      recipientId: recipient.id,
      recipient: { id: recipient.id } as any, // Not needed for create
      eventId,
      event: { id: eventId } as any, // Not needed for create
      message,
      viewed: false,
      rsvpStatus: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const invitation = await eventInvitationRepo.createAsync(invitationData);
    logger.info('Event invitation created', {
      invitationId: invitation.id,
      senderId,
      recipientId: recipient.id,
    });

    // Emit socket event to recipient
    socketManager.emitToUser(recipient.id, 'invitation-received', invitation);

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
    const { type, eventId } = req.query;

    let invitations: EventInvitation[];
    if (eventId) {
      // Get invitations for a specific event
      invitations = await eventInvitationRepo.getByEventIdAsync(eventId as string);
      // Filter to only those where user is sender or recipient
      invitations = invitations.filter(
        (inv) => inv.senderId === userId || inv.recipientId === userId
      );
    } else if (type === 'sent') {
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

    // Recipients can only update viewed and rsvpStatus, senders can update message, viewed, and rsvpStatus
    const updateData: Partial<EventInvitation> = {};
    if (existingInvitation.senderId === userId) {
      // Senders can update message, viewed, and rsvpStatus
      if (message !== undefined) updateData.message = message;
      if (viewed !== undefined) updateData.viewed = viewed;
      if (rsvpStatus !== undefined) updateData.rsvpStatus = rsvpStatus;
    }
    if (existingInvitation.recipientId === userId) {
      // Recipients can only update viewed and rsvpStatus
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

    // If RSVP status is set to Accepted, add user as event attendee if not already
    if (updateData.rsvpStatus === 'Accepted') {
      const existingAttendee = await eventAttendeeRepo.getByUserIdAndEventIdAsync(
        existingInvitation.recipientId,
        existingInvitation.eventId
      );
      if (!existingAttendee) {
        const attendeeData: EventAttendee = {
          id: '', // Will be generated
          userId: existingInvitation.recipientId,
          eventId: existingInvitation.eventId,
          user: { id: existingInvitation.recipientId } as any, // Not needed for create
          event: { id: existingInvitation.eventId } as any, // Not needed for create
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await eventAttendeeRepo.createAsync(attendeeData);
        logger.info('Event attendee created for accepted invitation', {
          userId: existingInvitation.recipientId,
          eventId: existingInvitation.eventId,
        });
      }
    }

    // Emit socket event to event host for RSVP updates
    if (updateData.rsvpStatus === 'Accepted' || updateData.rsvpStatus === 'Declined') {
      const event = await eventRepo.getByIdAsync(existingInvitation.eventId);
      if (event) {
        socketManager.emitToUser(event.hostId, 'invitation-rsvpd', {
          invitation: invitation,
          event: event,
        });
      }
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
    if (
      existingInvitation.senderId !== userId &&
      !(
        existingInvitation.recipientId === userId &&
        (existingInvitation.rsvpStatus === 'Accepted' ||
          existingInvitation.rsvpStatus === 'Declined')
      )
    ) {
      const response: IApiResponse<null> = {
        success: false,
        error: 'Only the sender or responded recipients can delete this invitation',
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
