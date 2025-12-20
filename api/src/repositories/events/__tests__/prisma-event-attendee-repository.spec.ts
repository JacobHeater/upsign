import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaEventAttendeeRepository } from '../prisma-event-attendee-repository';
import { EventAttendee, User, Event } from 'common/schema';

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
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        segmentAttendances: [],
        hostedEvents: [],
      } as User;

      const mockEvent: Event = {
        id: 'event1',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2023-12-25'),
        icon: '🎉',
        hostId: 'host1',
        location: 'Test Location',
        host: mockPrismaUser as unknown as User,
        segments: [],
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrismaEventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: mockPrismaUser,
        event: mockEvent,
      };

      (mockEventAttendeeFindUnique as any).mockResolvedValue(mockPrismaEventAttendee);

      const result = await repository.getByIdAsync('1');

      expect(mockEventAttendeeFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true, segments: true } },
        },
      });
      expect(result).toEqual({
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: {
          ...mockPrismaUser,
          dateOfBirth: mockPrismaUser.dateOfBirth,
          lastLogin: null,
          allergies: [],
          otps: [],
          attendances: [],
          segmentAttendances: [],
          hostedEvents: [],
        },
        event: {
          ...mockEvent,
          date: mockEvent.date,
          host: {
            ...mockPrismaUser,
            dateOfBirth: mockPrismaUser.dateOfBirth,
            lastLogin: null,
            allergies: [],
            otps: [],
            attendances: [],
            segmentAttendances: [],
            hostedEvents: [],
          },
          segments: [],
          attendees: [],
        },
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
        segmentAttendances: [],
        hostedEvents: [],
      };

      const mockEvent: Event = {
        id: 'event1',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2023-12-25'),
        icon: '🎉',
        hostId: 'host1',
        location: 'Test Location',
        createdAt: new Date(),
        updatedAt: new Date(),
        host: mockPrismaUser as unknown as User,
        segments: [],
        attendees: [],
      };

      const mockPrismaEventAttendees = [
        {
          id: '1',
          userId: 'user1',
          eventId: 'event1',
          user: mockPrismaUser,
          event: mockEvent,
        },
      ];

      (mockEventAttendeeFindMany as any).mockResolvedValue(mockPrismaEventAttendees);

      const result = await repository.getAllAsync();

      expect(mockEventAttendeeFindMany).toHaveBeenCalledWith({
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true, segments: true } },
        },
      });
      expect(result).toEqual([
        {
          id: '1',
          userId: 'user1',
          eventId: 'event1',
          user: {
            ...mockPrismaUser,
            dateOfBirth: mockPrismaUser.dateOfBirth,
            lastLogin: null,
            allergies: [],
            otps: [],
            attendances: [],
            segmentAttendances: [],
            hostedEvents: [],
          },
          event: {
            ...mockEvent,
            date: mockEvent.date,
            host: {
              ...mockPrismaUser,
              dateOfBirth: mockPrismaUser.dateOfBirth,
              lastLogin: null,
              allergies: [],
              otps: [],
              attendances: [],
              segmentAttendances: [],
              hostedEvents: [],
            },
            segments: [],
            attendees: [],
          },
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
        segmentAttendances: [],
        hostedEvents: [],
      };

      const mockEvent: Event = {
        id: 'event1',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2023-12-25'),
        icon: '🎉',
        hostId: 'host1',
        location: 'Test Location',
        createdAt: new Date(),
        updatedAt: new Date(),
        host: mockPrismaUser,
        segments: [],
        attendees: [],
      };

      const mockPrismaEventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: mockPrismaUser,
        event: mockEvent,
      };

      const input: EventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: mockPrismaUser,
        event: mockEvent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockEventAttendeeCreate as any).mockResolvedValue(mockPrismaEventAttendee);

      const result = await repository.createAsync(input);

      expect(mockEventAttendeeCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          eventId: 'event1',
        },
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true, segments: true } },
        },
      });
      expect(result).toEqual({
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: {
          ...mockPrismaUser,
          dateOfBirth: mockPrismaUser.dateOfBirth,
          lastLogin: null,
          allergies: [],
          otps: [],
          attendances: [],
          segmentAttendances: [],
          hostedEvents: [],
        },
        event: {
          ...mockEvent,
          date: mockEvent.date,
          host: {
            ...mockPrismaUser,
            dateOfBirth: mockPrismaUser.dateOfBirth,
            lastLogin: null,
            allergies: [],
            otps: [],
            attendances: [],
            segmentAttendances: [],
            hostedEvents: [],
          },
          segments: [],
          attendees: [],
        },
      });
    });
  });

  describe('updateAsync', () => {
    it('should update and return an event attendee', async () => {
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
        segmentAttendances: [],
        hostedEvents: [],
      };

      const mockEvent: Event = {
        id: 'event1',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2023-12-25'),
        icon: '🎉',
        hostId: 'host1',
        location: 'Test Location',
        createdAt: new Date(),
        updatedAt: new Date(),
        host: mockPrismaUser,
        segments: [],
        attendees: [],
      };

      const mockPrismaEventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: mockPrismaUser,
        event: mockEvent,
      };

      const input: EventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockPrismaUser,
        event: mockEvent,
      };

      (mockEventAttendeeUpdate as any).mockResolvedValue(mockPrismaEventAttendee);

      const result = await repository.updateAsync('1', input);

      expect(mockEventAttendeeUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          userId: 'user1',
          eventId: 'event1',
        },
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true, segments: true } },
        },
      });
      expect(result).toEqual({
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: {
          ...mockPrismaUser,
          dateOfBirth: mockPrismaUser.dateOfBirth,
          lastLogin: null,
          allergies: [],
          otps: [],
          attendances: [],
          segmentAttendances: [],
          hostedEvents: [],
        },
        event: {
          ...mockEvent,
          date: mockEvent.date,
          host: {
            ...mockPrismaUser,
            dateOfBirth: mockPrismaUser.dateOfBirth,
            lastLogin: null,
            allergies: [],
            otps: [],
            attendances: [],
            segmentAttendances: [],
            hostedEvents: [],
          },
          segments: [],
          attendees: [],
        },
      });
    });

    it('should return null when update fails', async () => {
      const input: EventAttendee = {
        id: '1',
        userId: 'user1',
        eventId: 'event1',
        user: {} as User,
        event: {} as Event,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockEventAttendeeUpdate as any).mockRejectedValue(new Error('Update failed'));

      const result = await repository.updateAsync('1', input);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete an event attendee and return true', async () => {
      (mockEventAttendeeDelete as any).mockResolvedValue({});

      const result = await repository.deleteAsync('1');

      expect(mockEventAttendeeDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockEventAttendeeDelete as any).mockRejectedValue(new Error('Delete failed'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
