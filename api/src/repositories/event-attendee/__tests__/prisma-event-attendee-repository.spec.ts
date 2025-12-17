import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventAttendeeRepository } from '../prisma-event-attendee-repository';
import { EventAttendee } from '../../../schema/event-attendee';
import { User } from '../../../schema/user';
import { EventSegment } from '../../../schema/event-segment';

const mockEventAttendeeFindUnique = jest.fn();
const mockEventAttendeeFindMany = jest.fn();
const mockEventAttendeeCreate = jest.fn();
const mockEventAttendeeUpdate = jest.fn();
const mockEventAttendeeDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventAttendee: {
      findUnique: mockEventAttendeeFindUnique,
      findMany: mockEventAttendeeFindMany,
      create: mockEventAttendeeCreate,
      update: mockEventAttendeeUpdate,
      delete: mockEventAttendeeDelete,
    },
  })),
}));

describe('PrismaEventAttendeeRepository', () => {
  let repository: PrismaEventAttendeeRepository;

  beforeEach(() => {
    repository = new PrismaEventAttendeeRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return an event attendee when found', async () => {
      const mockUser: User = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const mockEventAttendee: EventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: mockUser,
        segment: mockSegment,
        contributions: [],
      };

      (mockEventAttendeeFindUnique as any).mockResolvedValue(mockEventAttendee);

      const result = await repository.getByIdAsync('1');

      expect(mockEventAttendeeFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { user: true, segment: true, contributions: true },
      });
      expect(result).toEqual(mockEventAttendee);
    });

    it('should return null when event attendee not found', async () => {
      (mockEventAttendeeFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all event attendees', async () => {
      const mockUser: User = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const mockEventAttendees: EventAttendee[] = [
        {
          id: '1',
          userId: 'user1',
          segmentId: 'segment1',
          user: mockUser,
          segment: mockSegment,
          contributions: [],
        },
      ];

      (mockEventAttendeeFindMany as any).mockResolvedValue(mockEventAttendees);

      const result = await repository.getAllAsync();

      expect(mockEventAttendeeFindMany).toHaveBeenCalledWith({
        include: { user: true, segment: true, contributions: true },
      });
      expect(result).toEqual(mockEventAttendees);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event attendee', async () => {
      const mockUser: User = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const inputEventAttendee: EventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: mockUser,
        segment: mockSegment,
        contributions: [],
      };

      const createdEventAttendee = { ...inputEventAttendee };

      (mockEventAttendeeCreate as any).mockResolvedValue(createdEventAttendee);

      const result = await repository.createAsync(inputEventAttendee);

      expect(mockEventAttendeeCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          segmentId: 'segment1',
        },
        include: { user: true, segment: true, contributions: true },
      });
      expect(result).toEqual(createdEventAttendee);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event attendee', async () => {
      const mockUser: User = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const inputEventAttendee: EventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: mockUser,
        segment: mockSegment,
        contributions: [],
      };

      (mockEventAttendeeUpdate as any).mockResolvedValue(inputEventAttendee);

      const result = await repository.updateAsync('1', inputEventAttendee);

      expect(mockEventAttendeeUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          userId: 'user1',
          segmentId: 'segment1',
        },
        include: { user: true, segment: true, contributions: true },
      });
      expect(result).toEqual(inputEventAttendee);
    });

    it('should return null when update fails', async () => {
      (mockEventAttendeeUpdate as any).mockRejectedValue(new Error('Not found'));

      const mockUser: User = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const inputEventAttendee: EventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: mockUser,
        segment: mockSegment,
        contributions: [],
      };

      const result = await repository.updateAsync('1', inputEventAttendee);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete the event attendee and return true', async () => {
      (mockEventAttendeeDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventAttendeeDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventAttendeeDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
