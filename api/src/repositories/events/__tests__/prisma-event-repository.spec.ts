import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventRepository } from '../prisma-event-repository';
import { Event } from 'common/schema';

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
};

const mockEventFindUnique = jest.fn();
const mockEventFindMany = jest.fn();
const mockEventCreate = jest.fn();
const mockEventUpdate = jest.fn();
const mockEventDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    event: {
      findUnique: mockEventFindUnique,
      findMany: mockEventFindMany,
      create: mockEventCreate,
      update: mockEventUpdate,
      delete: mockEventDelete,
    },
  })),
}));

describe('PrismaEventRepository', () => {
  let repository: PrismaEventRepository;

  beforeEach(() => {
    repository = new PrismaEventRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return an event when found', async () => {
      const mockPrismaEvent = {
        id: '1',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        hostId: 'user1',
        host: mockUser,
        location: 'Test Location',
        segments: [],
      };

      (mockEventFindUnique as any).mockResolvedValue(mockPrismaEvent);

      const result = await repository.getByIdAsync('1');

      expect(mockEventFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          segments: {
            include: {
              attendees: {
                include: {
                  user: { include: { allergies: true } },
                  contributions: true,
                },
              },
            },
          },
          host: { include: { allergies: true } },
        },
      });
      expect(result).toEqual({
        id: '1',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        hostId: 'user1',
        host: { ...mockUser, allergies: [] },
        location: 'Test Location',
        segments: [],
      });
    });

    it('should return null when event not found', async () => {
      (mockEventFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all events', async () => {
      const mockPrismaEvents = [
        {
          id: '1',
          name: 'Test Event',
          date: new Date('2023-01-01'),
          hostId: 'user1',
          host: mockUser,
          location: 'Test Location',
          segments: [],
        },
      ];

      (mockEventFindMany as any).mockResolvedValue(mockPrismaEvents);

      const result = await repository.getAllAsync();

      expect(mockEventFindMany).toHaveBeenCalledWith({
        include: {
          segments: {
            include: {
              attendees: {
                include: {
                  user: { include: { allergies: true } },
                  contributions: true,
                },
              },
            },
          },
          host: { include: { allergies: true } },
        },
      });
      expect(result).toEqual([
        {
          id: '1',
          name: 'Test Event',
          date: new Date('2023-01-01'),
          hostId: 'user1',
          host: { ...mockUser, allergies: [] },
          location: 'Test Location',
          segments: [],
        },
      ]);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event', async () => {
      const inputEvent: Event = {
        id: '1',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        hostId: 'user1',
        host: { ...mockUser, allergies: [] },
        location: 'Test Location',
        segments: [],
      };

      const createdPrismaEvent = { ...inputEvent, host: { ...inputEvent.host, allergies: [] } };

      (mockEventCreate as any).mockResolvedValue(createdPrismaEvent);

      const result = await repository.createAsync(inputEvent);

      expect(mockEventCreate).toHaveBeenCalledWith({
        data: {
          name: 'Test Event',
          date: new Date('2023-01-01'),
          hostId: 'user1',
          location: 'Test Location',
        },
        include: {
          segments: {
            include: {
              attendees: {
                include: {
                  user: { include: { allergies: true } },
                  contributions: true,
                },
              },
            },
          },
          host: { include: { allergies: true } },
        },
      });
      expect(result).toEqual({
        ...createdPrismaEvent,
        host: { ...createdPrismaEvent.host, allergies: [] },
      });
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event', async () => {
      const inputEvent: Event = {
        id: '1',
        name: 'Updated Event',
        date: new Date('2023-01-01'),
        hostId: 'user1',
        host: { ...mockUser, allergies: [] },
        location: 'Updated Location',
        segments: [],
      };

      (mockEventUpdate as any).mockResolvedValue({
        ...inputEvent,
        host: { ...inputEvent.host, allergies: [] },
      });

      const result = await repository.updateAsync('1', inputEvent);

      expect(mockEventUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated Event',
          date: new Date('2023-01-01'),
          hostId: 'user1',
          location: 'Updated Location',
        },
        include: {
          segments: {
            include: {
              attendees: {
                include: {
                  user: { include: { allergies: true } },
                  contributions: true,
                },
              },
            },
          },
          host: { include: { allergies: true } },
        },
      });
      expect(result).toEqual(inputEvent);
    });

    it('should return null when update fails', async () => {
      (mockEventUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputEvent: Event = {
        id: '1',
        name: 'Updated Event',
        date: new Date('2023-01-01'),
        hostId: 'user1',
        host: { ...mockUser, allergies: [] },
        location: 'Updated Location',
        segments: [],
      };

      const result = await repository.updateAsync('1', inputEvent);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete the event and return true', async () => {
      (mockEventDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
