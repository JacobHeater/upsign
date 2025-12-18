import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventInvitationRepository } from '../prisma-event-invitation-repository';
import { EventInvitation, RsvpStatus } from 'common/schema';

const mockUser = {
  id: 'user1',
  firstName: 'John',
  lastName: 'Doe',
  allergies: [],
  email: 'john@example.com',
  dateOfBirth: new Date('1990-01-01'),
  phoneNumber: '+1234567890',
  verified: true,
  locked: false,
  lastLogin: null,
  otps: [],
  attendances: [],
  hostedEvents: [],
  sentInvitations: [],
  receivedInvitations: [],
};

const mockEventInvitationFindUnique = jest.fn() as jest.MockedFunction<any>;
const mockEventInvitationFindMany = jest.fn() as jest.MockedFunction<any>;
const mockEventInvitationCreate = jest.fn() as jest.MockedFunction<any>;
const mockEventInvitationUpdate = jest.fn() as jest.MockedFunction<any>;
const mockEventInvitationDelete = jest.fn() as jest.MockedFunction<any>;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventInvitation: {
      findUnique: mockEventInvitationFindUnique,
      findMany: mockEventInvitationFindMany,
      create: mockEventInvitationCreate,
      update: mockEventInvitationUpdate,
      delete: mockEventInvitationDelete,
    },
  })),
}));

describe('PrismaEventInvitationRepository', () => {
  let repository: PrismaEventInvitationRepository;

  beforeEach(() => {
    repository = new PrismaEventInvitationRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return invitation when found', async () => {
      const mockInvitation = {
        id: 'inv1',
        senderId: 'user1',
        recipientId: 'user2',
        message: 'Test message',
        viewed: false,
        rsvpStatus: RsvpStatus.Pending,
        sender: mockUser,
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
      };

      mockEventInvitationFindUnique.mockResolvedValue(mockInvitation);

      const result = await repository.getByIdAsync('inv1');

      expect(mockEventInvitationFindUnique).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result).toEqual({
        ...mockInvitation,
        sender: {
          ...mockInvitation.sender,
          dateOfBirth: mockInvitation.sender.dateOfBirth,
          lastLogin: null,
          otps: [],
        },
        recipient: {
          ...mockInvitation.recipient,
          dateOfBirth: mockInvitation.recipient.dateOfBirth,
          lastLogin: null,
          otps: [],
        },
      });
    });

    it('should return null when invitation not found', async () => {
      mockEventInvitationFindUnique.mockResolvedValue(null);

      const result = await repository.getByIdAsync('inv1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all invitations', async () => {
      const mockInvitations = [
        {
          id: 'inv1',
          senderId: 'user1',
          recipientId: 'user2',
          message: 'Test message 1',
          viewed: false,
          rsvpStatus: RsvpStatus.Pending,
          sender: mockUser,
          recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        },
        {
          id: 'inv2',
          senderId: 'user2',
          recipientId: 'user1',
          message: 'Test message 2',
          viewed: true,
          rsvpStatus: RsvpStatus.Accepted,
          sender: { ...mockUser, id: 'user2', email: 'jane@example.com' },
          recipient: mockUser,
        },
      ];

      mockEventInvitationFindMany.mockResolvedValue(mockInvitations);

      const result = await repository.getAllAsync();

      expect(mockEventInvitationFindMany).toHaveBeenCalledWith({
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('createAsync', () => {
    it('should create and return invitation', async () => {
      const inputInvitation: EventInvitation = {
        id: '',
        senderId: 'user1',
        sender: mockUser,
        recipientId: 'user2',
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        message: 'Test message',
        viewed: false,
        rsvpStatus: RsvpStatus.Pending,
      };

      const createdInvitation = {
        id: 'inv1',
        senderId: 'user1',
        recipientId: 'user2',
        message: 'Test message',
        viewed: false,
        rsvpStatus: RsvpStatus.Pending,
        sender: mockUser,
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
      };

      mockEventInvitationCreate.mockResolvedValue(createdInvitation);

      const result = await repository.createAsync(inputInvitation);

      expect(mockEventInvitationCreate).toHaveBeenCalledWith({
        data: {
          senderId: 'user1',
          recipientId: 'user2',
          message: 'Test message',
          viewed: false,
          rsvpStatus: RsvpStatus.Pending,
        },
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result?.id).toBe('inv1');
    });
  });

  describe('updateAsync', () => {
    it('should update and return invitation', async () => {
      const inputInvitation: EventInvitation = {
        id: 'inv1',
        senderId: 'user1',
        sender: mockUser,
        recipientId: 'user2',
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        message: 'Updated message',
        viewed: true,
        rsvpStatus: RsvpStatus.Accepted,
      };

      const updatedInvitation = {
        id: 'inv1',
        senderId: 'user1',
        recipientId: 'user2',
        message: 'Updated message',
        viewed: true,
        rsvpStatus: RsvpStatus.Accepted,
        sender: mockUser,
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
      };

      mockEventInvitationUpdate.mockResolvedValue(updatedInvitation);

      const result = await repository.updateAsync('inv1', inputInvitation);

      expect(mockEventInvitationUpdate).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: {
          senderId: 'user1',
          recipientId: 'user2',
          message: 'Updated message',
          viewed: true,
          rsvpStatus: RsvpStatus.Accepted,
        },
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result?.message).toBe('Updated message');
    });

    it('should return null when invitation not found', async () => {
      mockEventInvitationUpdate.mockRejectedValue(new Error('Not found'));

      const inputInvitation: EventInvitation = {
        id: 'inv1',
        senderId: 'user1',
        sender: mockUser,
        recipientId: 'user2',
        recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        message: 'Test message',
        viewed: false,
        rsvpStatus: RsvpStatus.Pending,
      };

      const result = await repository.updateAsync('inv1', inputInvitation);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should return true when invitation is deleted', async () => {
      mockEventInvitationDelete.mockResolvedValue({});

      const result = await repository.deleteAsync('inv1');

      expect(mockEventInvitationDelete).toHaveBeenCalledWith({
        where: { id: 'inv1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when invitation not found', async () => {
      mockEventInvitationDelete.mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('inv1');

      expect(result).toBe(false);
    });
  });

  describe('getByRecipientIdAsync', () => {
    it('should return invitations for recipient', async () => {
      const mockInvitations = [
        {
          id: 'inv1',
          senderId: 'user1',
          recipientId: 'user2',
          message: 'Test message',
          viewed: false,
          rsvpStatus: RsvpStatus.Pending,
          sender: mockUser,
          recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        },
      ];

      mockEventInvitationFindMany.mockResolvedValue(mockInvitations);

      const result = await repository.getByRecipientIdAsync('user2');

      expect(mockEventInvitationFindMany).toHaveBeenCalledWith({
        where: { recipientId: 'user2' },
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getBySenderIdAsync', () => {
    it('should return invitations for sender', async () => {
      const mockInvitations = [
        {
          id: 'inv1',
          senderId: 'user1',
          recipientId: 'user2',
          message: 'Test message',
          viewed: false,
          rsvpStatus: RsvpStatus.Pending,
          sender: mockUser,
          recipient: { ...mockUser, id: 'user2', email: 'jane@example.com' },
        },
      ];

      mockEventInvitationFindMany.mockResolvedValue(mockInvitations);

      const result = await repository.getBySenderIdAsync('user1');

      expect(mockEventInvitationFindMany).toHaveBeenCalledWith({
        where: { senderId: 'user1' },
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
        },
      });
      expect(result).toHaveLength(1);
    });
  });
});
