import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventRepository } from '../prisma-event-repository';
import { Event } from '../../../schema/event';

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
      const mockEvent: Event = {
        id: '1',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        location: 'Test Location',
        segments: [],
      };

      (mockEventFindUnique as any).mockResolvedValue(mockEvent);

      const result = await repository.getByIdAsync('1');

      expect(mockEventFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { segments: true },
      });
      expect(result).toEqual(mockEvent);
    });

    it('should return null when event not found', async () => {
      (mockEventFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all events', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          name: 'Test Event',
          date: new Date('2023-01-01'),
          location: 'Test Location',
          segments: [],
        },
      ];

      (mockEventFindMany as any).mockResolvedValue(mockEvents);

      const result = await repository.getAllAsync();

      expect(mockEventFindMany).toHaveBeenCalledWith({
        include: { segments: true },
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event', async () => {
      const inputEvent: Event = {
        id: '1',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        location: 'Test Location',
        segments: [],
      };

      const createdEvent = { ...inputEvent };

      (mockEventCreate as any).mockResolvedValue(createdEvent);

      const result = await repository.createAsync(inputEvent);

      expect(mockEventCreate).toHaveBeenCalledWith({
        data: {
          name: 'Test Event',
          date: new Date('2023-01-01'),
          location: 'Test Location',
        },
        include: { segments: true },
      });
      expect(result).toEqual(createdEvent);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event', async () => {
      const inputEvent: Event = {
        id: '1',
        name: 'Updated Event',
        date: new Date('2023-01-01'),
        location: 'Updated Location',
        segments: [],
      };

      (mockEventUpdate as any).mockResolvedValue(inputEvent);

      const result = await repository.updateAsync('1', inputEvent);

      expect(mockEventUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated Event',
          date: new Date('2023-01-01'),
          location: 'Updated Location',
        },
        include: { segments: true },
      });
      expect(result).toEqual(inputEvent);
    });

    it('should return null when update fails', async () => {
      (mockEventUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputEvent: Event = {
        id: '1',
        name: 'Updated Event',
        date: new Date('2023-01-01'),
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
