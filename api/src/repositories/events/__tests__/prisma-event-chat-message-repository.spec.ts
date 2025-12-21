import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventChatMessageRepository } from '../prisma-event-chat-message-repository';
import { EventChatMessage } from 'common';

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
  createdAt: new Date(),
  updatedAt: new Date(),
  otps: [],
  attendances: [],
  segmentAttendances: [],
  hostedEvents: [],
};

const mockEvent = {
  id: 'event1',
  name: 'Test Event',
  description: 'Test Description',
  date: new Date('2023-01-01'),
  icon: '🎉',
  hostId: 'user1',
  host: mockUser,
  location: 'Test Location',
  createdAt: new Date(),
  updatedAt: new Date(),
  segments: [],
  attendees: [],
};

const mockMessage = {
  id: 'message1',
  userId: 'user1',
  user: mockUser,
  eventId: 'event1',
  event: mockEvent,
  message: 'Hello',
  createdAt: new Date(),
  updatedAt: new Date(),
  reactions: [],
};

const mockEventChatMessageFindUnique = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageFindMany = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageCreate = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageUpdate = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageDelete = jest.fn() as jest.MockedFunction<any>;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventChatMessage: {
      findUnique: mockEventChatMessageFindUnique,
      findMany: mockEventChatMessageFindMany,
      create: mockEventChatMessageCreate,
      update: mockEventChatMessageUpdate,
      delete: mockEventChatMessageDelete,
    },
  })),
}));

describe('PrismaEventChatMessageRepository', () => {
  let repository: PrismaEventChatMessageRepository;

  beforeEach(() => {
    repository = new PrismaEventChatMessageRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return message when found', async () => {
      mockEventChatMessageFindUnique.mockResolvedValue(mockMessage);

      const result = await repository.getByIdAsync('message1');

      expect(mockEventChatMessageFindUnique).toHaveBeenCalledWith({
        where: { id: 'message1' },
        include: {
          user: { include: { allergies: true } },
          event: true,
          reactions: {
            include: {
              user: { include: { allergies: true } },
            },
          },
        },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('message1');
    });

    it('should return null when not found', async () => {
      mockEventChatMessageFindUnique.mockResolvedValue(null);

      const result = await repository.getByIdAsync('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all messages', async () => {
      mockEventChatMessageFindMany.mockResolvedValue([mockMessage]);

      const result = await repository.getAllAsync();

      expect(mockEventChatMessageFindMany).toHaveBeenCalledWith({
        include: {
          user: { include: { allergies: true } },
          event: true,
          reactions: {
            include: {
              user: { include: { allergies: true } },
            },
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getByEventIdAsync', () => {
    it('should return messages for event', async () => {
      mockEventChatMessageFindMany.mockResolvedValue([mockMessage]);

      const result = await repository.getByEventIdAsync('event1');

      expect(mockEventChatMessageFindMany).toHaveBeenCalledWith({
        where: { eventId: 'event1' },
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true } },
          reactions: {
            include: {
              user: { include: { allergies: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createAsync', () => {
    it('should create message', async () => {
      const newMessage: EventChatMessage = {
        id: '',
        userId: 'user1',
        user: mockUser,
        eventId: 'event1',
        event: mockEvent,
        message: 'New message',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockEventChatMessageCreate.mockResolvedValue({ ...mockMessage, message: 'New message' });

      const result = await repository.createAsync(newMessage);

      expect(mockEventChatMessageCreate).toHaveBeenCalled();
      expect(result.message).toBe('New message');
    });
  });

  describe('updateAsync', () => {
    it('should update message', async () => {
      const updatedMessage: EventChatMessage = { ...mockMessage, message: 'Updated' };
      mockEventChatMessageUpdate.mockResolvedValue(updatedMessage);

      const result = await repository.updateAsync('message1', updatedMessage);

      expect(mockEventChatMessageUpdate).toHaveBeenCalledWith({
        where: { id: 'message1' },
        data: expect.any(Object),
        include: expect.any(Object),
      });
      expect(result?.message).toBe('Updated');
    });
  });

  describe('deleteAsync', () => {
    it('should delete message', async () => {
      mockEventChatMessageDelete.mockResolvedValue(mockMessage);

      const result = await repository.deleteAsync('message1');

      expect(mockEventChatMessageDelete).toHaveBeenCalledWith({
        where: { id: 'message1' },
      });
      expect(result).toBe(true);
    });
  });
});
