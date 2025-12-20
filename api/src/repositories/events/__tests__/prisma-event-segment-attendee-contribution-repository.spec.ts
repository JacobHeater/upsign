import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventSegmentAttendeeContributionRepository } from '../prisma-event-segment-attendee-contribution-repository';
import { EventSegmentAttendeeContribution } from 'common/schema';

const mockEventSegmentAttendeeContributionFindUnique = jest.fn();
const mockEventSegmentAttendeeContributionFindMany = jest.fn();
const mockEventSegmentAttendeeContributionCreate = jest.fn();
const mockEventSegmentAttendeeContributionUpdate = jest.fn();
const mockEventSegmentAttendeeContributionDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventSegmentAttendeeContribution: {
      findUnique: mockEventSegmentAttendeeContributionFindUnique,
      findMany: mockEventSegmentAttendeeContributionFindMany,
      create: mockEventSegmentAttendeeContributionCreate,
      update: mockEventSegmentAttendeeContributionUpdate,
      delete: mockEventSegmentAttendeeContributionDelete,
    },
  })),
}));

describe('PrismaEventSegmentAttendeeContributionRepository', () => {
  let repository: PrismaEventSegmentAttendeeContributionRepository;

  beforeEach(() => {
    repository = new PrismaEventSegmentAttendeeContributionRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return an event attendee contribution when found', async () => {
      const mockEventAttendeeContribution: EventSegmentAttendeeContribution = {
        id: '1',
        item: 'Test Item',
        description: 'Test Description',
        quantity: 1,
        eventSegmentAttendeeId: 'attendee1',
        createdAt: new Date(),
        updatedAt: new Date(),
        eventSegmentAttendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+1234567890',
            allergies: [],
            dateOfBirth: new Date('1990-01-01'),
            verified: true,
            locked: false,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attendees: [],
          },
          contributions: [],
        },
      };

      (mockEventSegmentAttendeeContributionFindUnique as any).mockResolvedValue(
        mockEventAttendeeContribution
      );

      const result = await repository.getByIdAsync('1');

      expect(mockEventSegmentAttendeeContributionFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
      expect(result).toEqual(mockEventAttendeeContribution);
    });

    it('should return null when event attendee contribution not found', async () => {
      (mockEventSegmentAttendeeContributionFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all event attendee contributions', async () => {
      const mockEventAttendeeContributions: EventSegmentAttendeeContribution[] = [
        {
          id: '1',
          item: 'Test Item',
          description: 'Test Description',
          quantity: 1,
          eventSegmentAttendeeId: 'attendee1',
          createdAt: new Date(),
          updatedAt: new Date(),
          eventSegmentAttendee: {
            id: 'attendee1',
            userId: 'user1',
            segmentId: 'segment1',
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: 'user1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: '+1234567890',
              allergies: [],
              dateOfBirth: new Date('1990-01-01'),
              verified: true,
              locked: false,
              lastLogin: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              otps: [],
              attendances: [],
              hostedEvents: [],
            },
            segment: {
              id: 'segment1',
              name: 'Test Segment',
              eventId: 'event1',
              createdAt: new Date(),
              updatedAt: new Date(),
              attendees: [],
            },
            contributions: [],
          },
        },
      ];

      (mockEventSegmentAttendeeContributionFindMany as any).mockResolvedValue(
        mockEventAttendeeContributions
      );

      const result = await repository.getAllAsync();

      expect(mockEventSegmentAttendeeContributionFindMany).toHaveBeenCalledWith({
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
      expect(result).toEqual(mockEventAttendeeContributions);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event attendee contribution', async () => {
      const inputEventAttendeeContribution: EventSegmentAttendeeContribution = {
        id: '1',
        item: 'Test Item',
        description: 'Test Description',
        quantity: 1,
        eventSegmentAttendeeId: 'attendee1',
        createdAt: new Date(),
        updatedAt: new Date(),
        eventSegmentAttendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+1234567890',
            allergies: [],
            dateOfBirth: new Date('1990-01-01'),
            verified: true,
            locked: false,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attendees: [],
          },
          contributions: [],
        },
      };

      const createdEventAttendeeContribution = {
        ...inputEventAttendeeContribution,
        eventSegmentAttendee: inputEventAttendeeContribution.eventSegmentAttendee,
      };

      (mockEventSegmentAttendeeContributionCreate as any).mockResolvedValue(
        createdEventAttendeeContribution
      );

      const result = await repository.createAsync(inputEventAttendeeContribution);

      expect(mockEventSegmentAttendeeContributionCreate).toHaveBeenCalledWith({
        data: {
          item: 'Test Item',
          description: 'Test Description',
          quantity: 1,
          eventSegmentAttendeeId: 'attendee1',
        },
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
      expect(result).toEqual(createdEventAttendeeContribution);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event attendee contribution', async () => {
      const inputEventAttendeeContribution: EventSegmentAttendeeContribution = {
        id: '1',
        item: 'Updated Item',
        description: 'Updated Description',
        quantity: 2,
        eventSegmentAttendeeId: 'attendee1',
        createdAt: new Date(),
        updatedAt: new Date(),
        eventSegmentAttendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+1234567890',
            allergies: [],
            dateOfBirth: new Date('1990-01-01'),
            verified: true,
            locked: false,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attendees: [],
          },
          contributions: [],
        },
      };

      const updatedEventAttendeeContribution = {
        ...inputEventAttendeeContribution,
        eventSegmentAttendee: inputEventAttendeeContribution.eventSegmentAttendee,
      };

      (mockEventSegmentAttendeeContributionUpdate as any).mockResolvedValue(
        updatedEventAttendeeContribution
      );

      const result = await repository.updateAsync('1', inputEventAttendeeContribution);

      expect(mockEventSegmentAttendeeContributionUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          item: 'Updated Item',
          description: 'Updated Description',
          quantity: 2,
          eventSegmentAttendeeId: 'attendee1',
        },
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
      expect(result).toEqual(updatedEventAttendeeContribution);
    });

    it('should return null when update fails', async () => {
      (mockEventSegmentAttendeeContributionUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputEventAttendeeContribution: EventSegmentAttendeeContribution = {
        id: '1',
        item: 'Updated Item',
        description: 'Updated Description',
        quantity: 2,
        eventSegmentAttendeeId: 'attendee1',
        createdAt: new Date(),
        updatedAt: new Date(),
        eventSegmentAttendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+1234567890',
            allergies: [],
            dateOfBirth: new Date('1990-01-01'),
            verified: true,
            locked: false,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attendees: [],
          },
          contributions: [],
        },
      };

      const result = await repository.updateAsync('1', inputEventAttendeeContribution);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete the event attendee contribution and return true', async () => {
      (mockEventSegmentAttendeeContributionDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventSegmentAttendeeContributionDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventSegmentAttendeeContributionDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
