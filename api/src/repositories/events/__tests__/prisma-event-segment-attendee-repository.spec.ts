import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventSegmentAttendeeRepository } from '../prisma-event-segment-attendee-repository';
import { EventSegmentAttendee, User, EventSegment } from 'common';

const mockEventSegmentAttendeeFindUnique = jest.fn();
const mockEventSegmentAttendeeFindMany = jest.fn();
const mockEventSegmentAttendeeCreate = jest.fn();
const mockEventSegmentAttendeeUpdate = jest.fn();
const mockEventSegmentAttendeeDelete = jest.fn();
const mockEventSegmentAttendeeContributionDeleteMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventSegmentAttendee: {
      findUnique: mockEventSegmentAttendeeFindUnique,
      findMany: mockEventSegmentAttendeeFindMany,
      create: mockEventSegmentAttendeeCreate,
      update: mockEventSegmentAttendeeUpdate,
      delete: mockEventSegmentAttendeeDelete,
    },
    eventSegmentAttendeeContribution: {
      deleteMany: mockEventSegmentAttendeeContributionDeleteMany,
    },
  })),
}));

describe('PrismaEventSegmentAttendeeRepository', () => {
  let repository: PrismaEventSegmentAttendeeRepository;

  beforeEach(() => {
    repository = new PrismaEventSegmentAttendeeRepository();
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
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      const mockPrismaEventAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockPrismaUser,
        segment: mockSegment,
        contributions: [],
      };

      (mockEventSegmentAttendeeFindUnique as any).mockResolvedValue(mockPrismaEventAttendee);

      const result = await repository.getByIdAsync('1');

      expect(mockEventSegmentAttendeeFindUnique).toHaveBeenCalledWith({
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
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        user: { ...mockPrismaUser, allergies: [] },
        segment: mockSegment,
        contributions: [],
      });
    });

    it('should return null when event attendee not found', async () => {
      (mockEventSegmentAttendeeFindUnique as any).mockResolvedValue(null);

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
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      const mockPrismaEventAttendees = [
        {
          id: '1',
          userId: 'user1',
          segmentId: 'segment1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: mockPrismaUser,
          segment: mockSegment,
          contributions: [],
        },
      ];

      (mockEventSegmentAttendeeFindMany as any).mockResolvedValue(mockPrismaEventAttendees);

      const result = await repository.getAllAsync();

      expect(mockEventSegmentAttendeeFindMany).toHaveBeenCalledWith({
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
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
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
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      const inputEventAttendee: EventSegmentAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        createdAt: new Date(),
        updatedAt: new Date(),
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

      (mockEventSegmentAttendeeCreate as any).mockResolvedValue(createdPrismaEventAttendee);

      const result = await repository.createAsync(inputEventAttendee);

      expect(mockEventSegmentAttendeeCreate).toHaveBeenCalledWith({
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
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      const inputEventAttendee: EventSegmentAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        createdAt: new Date(),
        updatedAt: new Date(),
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

      (mockEventSegmentAttendeeUpdate as any).mockResolvedValue(updatedPrismaEventAttendee);

      const result = await repository.updateAsync('1', inputEventAttendee);

      expect(mockEventSegmentAttendeeUpdate).toHaveBeenCalledWith({
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
      (mockEventSegmentAttendeeUpdate as any).mockRejectedValue(new Error('Not found'));

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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSegment: EventSegment = {
        id: 'segment1',
        name: 'Test Segment',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      const inputEventAttendee: EventSegmentAttendee = {
        id: '1',
        userId: 'user1',
        segmentId: 'segment1',
        createdAt: new Date(),
        updatedAt: new Date(),
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
      (mockEventSegmentAttendeeContributionDeleteMany as any).mockResolvedValue({} as any);
      (mockEventSegmentAttendeeDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventSegmentAttendeeContributionDeleteMany).toHaveBeenCalledWith({
        where: { eventSegmentAttendeeId: '1' },
      });
      expect(mockEventSegmentAttendeeDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventSegmentAttendeeContributionDeleteMany as any).mockResolvedValue({} as any);
      (mockEventSegmentAttendeeDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
