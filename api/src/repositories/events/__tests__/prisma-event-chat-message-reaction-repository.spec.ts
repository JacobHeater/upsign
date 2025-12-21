import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventChatMessageReactionRepository } from '../prisma-event-chat-message-reaction-repository';
import { EventChatMessageReaction } from 'common';

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

const mockReaction = {
  id: 'reaction1',
  messageId: 'message1',
  message: mockMessage,
  userId: 'user1',
  user: mockUser,
  reaction: '👍',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEventChatMessageReactionFindUnique = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageReactionFindMany = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageReactionCreate = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageReactionUpdate = jest.fn() as jest.MockedFunction<any>;
const mockEventChatMessageReactionDelete = jest.fn() as jest.MockedFunction<any>;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventChatMessageReaction: {
      findUnique: mockEventChatMessageReactionFindUnique,
      findMany: mockEventChatMessageReactionFindMany,
      create: mockEventChatMessageReactionCreate,
      update: mockEventChatMessageReactionUpdate,
      delete: mockEventChatMessageReactionDelete,
    },
  })),
}));

describe('PrismaEventChatMessageReactionRepository', () => {
  let repository: PrismaEventChatMessageReactionRepository;

  beforeEach(() => {
    repository = new PrismaEventChatMessageReactionRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return reaction when found', async () => {
      mockEventChatMessageReactionFindUnique.mockResolvedValue(mockReaction);

      const result = await repository.getByIdAsync('reaction1');

      expect(mockEventChatMessageReactionFindUnique).toHaveBeenCalledWith({
        where: { id: 'reaction1' },
        include: {
          user: { include: { allergies: true } },
          message: {
            include: {
              user: { include: { allergies: true } },
              event: true,
              reactions: {
                include: {
                  user: { include: { allergies: true } },
                },
              },
            },
          },
        },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('reaction1');
    });

    it('should return null when not found', async () => {
      mockEventChatMessageReactionFindUnique.mockResolvedValue(null);

      const result = await repository.getByIdAsync('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all reactions', async () => {
      mockEventChatMessageReactionFindMany.mockResolvedValue([mockReaction]);

      const result = await repository.getAllAsync();

      expect(mockEventChatMessageReactionFindMany).toHaveBeenCalledWith({
        include: {
          user: { include: { allergies: true } },
          message: {
            include: {
              user: { include: { allergies: true } },
              event: true,
              reactions: {
                include: {
                  user: { include: { allergies: true } },
                },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getByMessageIdAsync', () => {
    it('should return reactions for message', async () => {
      mockEventChatMessageReactionFindMany.mockResolvedValue([mockReaction]);

      const result = await repository.getByMessageIdAsync('message1');

      expect(mockEventChatMessageReactionFindMany).toHaveBeenCalledWith({
        where: { messageId: 'message1' },
        include: {
          user: { include: { allergies: true } },
          message: {
            include: {
              user: { include: { allergies: true } },
              event: { include: { host: true } },
              reactions: {
                include: {
                  user: { include: { allergies: true } },
                },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createAsync', () => {
    it('should create reaction', async () => {
      const newReaction: EventChatMessageReaction = {
        id: '',
        messageId: 'message1',
        message: mockMessage,
        userId: 'user1',
        user: mockUser,
        reaction: '❤️',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockEventChatMessageReactionCreate.mockResolvedValue({ ...mockReaction, reaction: '❤️' });

      const result = await repository.createAsync(newReaction);

      expect(mockEventChatMessageReactionCreate).toHaveBeenCalled();
      expect(result.reaction).toBe('❤️');
    });
  });

  describe('updateAsync', () => {
    it('should update reaction', async () => {
      const updatedReaction: EventChatMessageReaction = { ...mockReaction, reaction: '😊' };
      mockEventChatMessageReactionUpdate.mockResolvedValue(updatedReaction);

      const result = await repository.updateAsync('reaction1', updatedReaction);

      expect(mockEventChatMessageReactionUpdate).toHaveBeenCalledWith({
        where: { id: 'reaction1' },
        data: expect.any(Object),
        include: expect.any(Object),
      });
      expect(result?.reaction).toBe('😊');
    });
  });

  describe('deleteAsync', () => {
    it('should delete reaction', async () => {
      mockEventChatMessageReactionDelete.mockResolvedValue(mockReaction);

      const result = await repository.deleteAsync('reaction1');

      expect(mockEventChatMessageReactionDelete).toHaveBeenCalledWith({
        where: { id: 'reaction1' },
      });
      expect(result).toBe(true);
    });
  });
});
