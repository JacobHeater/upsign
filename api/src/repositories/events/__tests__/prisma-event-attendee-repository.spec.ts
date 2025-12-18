import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventAttendeeRepository } from '../prisma-event-attendee-repository';
import { EventAttendee, User, EventSegment } from 'common/schema';

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
      const mockPrismaUser = {
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
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const mockPrismaEventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: mockPrismaUser,
        segment: mockSegment,
        contributions: [],
      };

      (mockEventAttendeeFindUnique as any).mockResolvedValue(mockPrismaEventAttendee);

      const result = await repository.getByIdAsync('1');

      expect(mockEventAttendeeFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      expect(result).toEqual({
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      });
    });

    it('should return null when event attendee not found', async () => {
      (mockEventAttendeeFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all event attendees', async () => {
      const mockPrismaUser = {
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
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        attendees: [],
      };

      const mockPrismaEventAttendees = [
        {
          id: '1',
          userId: 'user1',
          segmentId: 'segment1',
          user: mockPrismaUser,
          segment: mockSegment,
          contributions: [],
        },
      ];

      (mockEventAttendeeFindMany as any).mockResolvedValue(mockPrismaEventAttendees);

      const result = await repository.getAllAsync();

      expect(mockEventAttendeeFindMany).toHaveBeenCalledWith({
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      expect(result).toEqual([
        {
          id: '1',
          userId: 'user1',
          segmentId: 'segment1',
          user: { ...mockPrismaUser, allergies: [] },
          segment: mockSegment,
          contributions: [],
        },
      ]);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event attendee', async () => {
      const mockPrismaUser = {
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
        otps: [],
        attendances: [],
        hostedEvents: [],
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
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      };

      const createdPrismaEventAttendee = {
        ...inputEventAttendee,
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      };

      (mockEventAttendeeCreate as any).mockResolvedValue(createdPrismaEventAttendee);

      const result = await repository.createAsync(inputEventAttendee);

      expect(mockEventAttendeeCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          segmentId: 'segment1',
        },
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      expect(result).toEqual({
        ...createdPrismaEventAttendee,
        user: { ...createdPrismaEventAttendee.user, allergies: [] },
        segment: mockSegment,
        contributions: [],
      });
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event attendee', async () => {
      const mockPrismaUser = {
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
        otps: [],
        attendances: [],
        hostedEvents: [],
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
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      };

      const updatedPrismaEventAttendee = {
        ...inputEventAttendee,
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      };

      (mockEventAttendeeUpdate as any).mockResolvedValue(updatedPrismaEventAttendee);

      const result = await repository.updateAsync('1', inputEventAttendee);

      expect(mockEventAttendeeUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          userId: 'user1',
          segmentId: 'segment1',
        },
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      expect(result).toEqual({
        ...updatedPrismaEventAttendee,
        user: { ...updatedPrismaEventAttendee.user, allergies: [] },
        segment: mockSegment,
        contributions: [],
      });
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
        otps: [],
        attendances: [],
        hostedEvents: [],
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
