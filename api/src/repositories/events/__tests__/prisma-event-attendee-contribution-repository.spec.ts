import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventAttendeeContributionRepository } from '../prisma-event-attendee-contribution-repository';
import { EventAttendeeContribution } from 'common/schema';

const mockEventAttendeeContributionFindUnique = jest.fn();
const mockEventAttendeeContributionFindMany = jest.fn();
const mockEventAttendeeContributionCreate = jest.fn();
const mockEventAttendeeContributionUpdate = jest.fn();
const mockEventAttendeeContributionDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    eventAttendeeContribution: {
      findUnique: mockEventAttendeeContributionFindUnique,
      findMany: mockEventAttendeeContributionFindMany,
      create: mockEventAttendeeContributionCreate,
      update: mockEventAttendeeContributionUpdate,
      delete: mockEventAttendeeContributionDelete,
    },
  })),
}));

describe('PrismaEventAttendeeContributionRepository', () => {
  let repository: PrismaEventAttendeeContributionRepository;

  beforeEach(() => {
    repository = new PrismaEventAttendeeContributionRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return an event attendee contribution when found', async () => {
      const mockEventAttendeeContribution: EventAttendeeContribution = {
        id: '1',
        item: 'Test Item',
        description: 'Test Description',
        quantity: 1,
        attendeeId: 'attendee1',
        attendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
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
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            attendees: [],
          },
          contributions: [],
        },
      };

      (mockEventAttendeeContributionFindUnique as any).mockResolvedValue(
        mockEventAttendeeContribution
      );

      const result = await repository.getByIdAsync('1');

      expect(mockEventAttendeeContributionFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { attendee: true },
      });
      expect(result).toEqual(mockEventAttendeeContribution);
    });

    it('should return null when event attendee contribution not found', async () => {
      (mockEventAttendeeContributionFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all event attendee contributions', async () => {
      const mockEventAttendeeContributions: EventAttendeeContribution[] = [
        {
          id: '1',
          item: 'Test Item',
          description: 'Test Description',
          quantity: 1,
          attendeeId: 'attendee1',
          attendee: {
            id: 'attendee1',
            userId: 'user1',
            segmentId: 'segment1',
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
              otps: [],
              attendances: [],
              hostedEvents: [],
            },
            segment: {
              id: 'segment1',
              name: 'Test Segment',
              eventId: 'event1',
              attendees: [],
            },
            contributions: [],
          },
        },
      ];

      (mockEventAttendeeContributionFindMany as any).mockResolvedValue(
        mockEventAttendeeContributions
      );

      const result = await repository.getAllAsync();

      expect(mockEventAttendeeContributionFindMany).toHaveBeenCalledWith({
        include: { attendee: true },
      });
      expect(result).toEqual(mockEventAttendeeContributions);
    });
  });

  describe('createAsync', () => {
    it('should create and return an event attendee contribution', async () => {
      const inputEventAttendeeContribution: EventAttendeeContribution = {
        id: '1',
        item: 'Test Item',
        description: 'Test Description',
        quantity: 1,
        attendeeId: 'attendee1',
        attendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
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
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            attendees: [],
          },
          contributions: [],
        },
      };

      const createdEventAttendeeContribution = {
        ...inputEventAttendeeContribution,
        attendee: inputEventAttendeeContribution.attendee,
      };

      (mockEventAttendeeContributionCreate as any).mockResolvedValue(
        createdEventAttendeeContribution
      );

      const result = await repository.createAsync(inputEventAttendeeContribution);

      expect(mockEventAttendeeContributionCreate).toHaveBeenCalledWith({
        data: {
          item: 'Test Item',
          description: 'Test Description',
          quantity: 1,
          attendeeId: 'attendee1',
        },
        include: { attendee: true },
      });
      expect(result).toEqual(createdEventAttendeeContribution);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the event attendee contribution', async () => {
      const inputEventAttendeeContribution: EventAttendeeContribution = {
        id: '1',
        item: 'Updated Item',
        description: 'Updated Description',
        quantity: 2,
        attendeeId: 'attendee1',
        attendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
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
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
            attendees: [],
          },
          contributions: [],
        },
      };

      const updatedEventAttendeeContribution = {
        ...inputEventAttendeeContribution,
        attendee: inputEventAttendeeContribution.attendee,
      };

      (mockEventAttendeeContributionUpdate as any).mockResolvedValue(
        updatedEventAttendeeContribution
      );

      const result = await repository.updateAsync('1', inputEventAttendeeContribution);

      expect(mockEventAttendeeContributionUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          item: 'Updated Item',
          description: 'Updated Description',
          quantity: 2,
          attendeeId: 'attendee1',
        },
        include: { attendee: true },
      });
      expect(result).toEqual(updatedEventAttendeeContribution);
    });

    it('should return null when update fails', async () => {
      (mockEventAttendeeContributionUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputEventAttendeeContribution: EventAttendeeContribution = {
        id: '1',
        item: 'Updated Item',
        description: 'Updated Description',
        quantity: 2,
        attendeeId: 'attendee1',
        attendee: {
          id: 'attendee1',
          userId: 'user1',
          segmentId: 'segment1',
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
            otps: [],
            attendances: [],
            hostedEvents: [],
          },
          segment: {
            id: 'segment1',
            name: 'Test Segment',
            eventId: 'event1',
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
      (mockEventAttendeeContributionDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockEventAttendeeContributionDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventAttendeeContributionDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
