import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventSegmentRepository } from '../prisma-event-segment-repository';
import { EventSegment } from 'common/schema';

const mockEventSegmentFindUnique = jest.fn();
const mockEventSegmentFindMany = jest.fn();
const mockEventSegmentCreate = jest.fn();
const mockEventSegmentUpdate = jest.fn();
const mockEventSegmentDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventSegment: {
      findUnique: mockEventSegmentFindUnique,
      findMany: mockEventSegmentFindMany,
      create: mockEventSegmentCreate,
      update: mockEventSegmentUpdate,
      delete: mockEventSegmentDelete,
    },
  })),
}));

describe('PrismaEventSegmentRepository', () => {
  let repository: PrismaEventSegmentRepository;

  beforeEach(() => {
    repository = new PrismaEventSegmentRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return an event segment when found', async () => {
      const mockEventSegment: EventSegment = {
        id: '1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      (mockEventSegmentFindUnique as any).mockResolvedValue(mockEventSegment);

      const result = await repository.getByIdAsync('1');

      expect(mockEventSegmentFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { attendees: true },
      });
      expect(result).toEqual(mockEventSegment);
    });

    it('should return null when event segment not found', async () => {
      (mockEventSegmentFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all event segments', async () => {
      const mockEventSegments: EventSegment[] = [
        {
          id: '1',
          name: 'Test Segment',
          eventId: 'event1',
          attendees: [],
        },
      ];

      (mockEventSegmentFindMany as any).mockResolvedValue(mockEventSegments);

      const result = await repository.getAllAsync();

      expect(mockEventSegmentFindMany).toHaveBeenCalledWith({
        include: { attendees: true },
      });
      expect(result).toEqual(mockEventSegments);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event segment', async () => {
      const inputEventSegment: EventSegment = {
        id: '1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const createdEventSegment = { ...inputEventSegment, attendees: [] };

      (mockEventSegmentCreate as any).mockResolvedValue(createdEventSegment);

      const result = await repository.createAsync(inputEventSegment);

      expect(mockEventSegmentCreate).toHaveBeenCalledWith({
        data: {
          name: 'Test Segment',
          eventId: 'event1',
        },
        include: { attendees: true },
      });
      expect(result).toEqual(createdEventSegment);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event segment', async () => {
      const inputEventSegment: EventSegment = {
        id: '1',
        name: 'Updated Segment',
        eventId: 'event1',
        attendees: [],
      };

      const updatedEventSegment = { ...inputEventSegment, attendees: [] };

      (mockEventSegmentUpdate as any).mockResolvedValue(updatedEventSegment);

      const result = await repository.updateAsync('1', inputEventSegment);

      expect(mockEventSegmentUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated Segment',
          eventId: 'event1',
        },
        include: { attendees: true },
      });
      expect(result).toEqual(updatedEventSegment);
    });

    it('should return null when update fails', async () => {
      (mockEventSegmentUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputEventSegment: EventSegment = {
        id: '1',
        name: 'Updated Segment',
        eventId: 'event1',
        attendees: [],
      };

      const result = await repository.updateAsync('1', inputEventSegment);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete the event segment and return true', async () => {
      (mockEventSegmentDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventSegmentDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventSegmentDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
