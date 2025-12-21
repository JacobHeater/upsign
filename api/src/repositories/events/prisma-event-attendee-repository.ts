import { EventAttendee } from 'common';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventAttendeeRepository extends PrismaRepositoryBase<EventAttendee> {
  async getByIdAsync(id: string): Promise<EventAttendee | null> {
    const eventAttendee = await this.prisma.eventAttendee.findUnique({
      where: { id },
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true, segments: true } },
      },
    });
    return eventAttendee ? this.mapToEventAttendee(eventAttendee) : null;
  }

  async getByUserIdAndEventIdAsync(userId: string, eventId: string): Promise<EventAttendee | null> {
    const eventAttendee = await this.prisma.eventAttendee.findFirst({
      where: { userId, eventId },
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true, segments: true } },
      },
    });
    return eventAttendee ? this.mapToEventAttendee(eventAttendee) : null;
  }

  async getAllAsync(): Promise<EventAttendee[]> {
    const eventAttendees = await this.prisma.eventAttendee.findMany({
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true, segments: true } },
      },
    });
    return eventAttendees.map(this.mapToEventAttendee);
  }

  async createAsync(item: EventAttendee): Promise<EventAttendee> {
    const { id, user, event, createdAt, updatedAt, ...data } = item;
    const eventAttendee = await this.prisma.eventAttendee.create({
      data,
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true, segments: true } },
      },
    });
    return this.mapToEventAttendee(eventAttendee);
  }

  async updateAsync(id: string, item: EventAttendee): Promise<EventAttendee | null> {
    const { id: _, user, event, createdAt, updatedAt, ...data } = item;
    try {
      const eventAttendee = await this.prisma.eventAttendee.update({
        where: { id },
        data,
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true, segments: true } },
        },
      });
      return this.mapToEventAttendee(eventAttendee);
    } catch (error) {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventAttendee.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToEventAttendee(prismaEventAttendee: any): EventAttendee {
    return {
      id: prismaEventAttendee.id,
      userId: prismaEventAttendee.userId,
      eventId: prismaEventAttendee.eventId,
      createdAt: prismaEventAttendee.createdAt,
      updatedAt: prismaEventAttendee.updatedAt,
      user: {
        ...prismaEventAttendee.user,
        dateOfBirth: prismaEventAttendee.user.dateOfBirth,
        lastLogin: prismaEventAttendee.user.lastLogin?.toISOString() || null,
        allergies: prismaEventAttendee.user.allergies || [],
        otps: prismaEventAttendee.user.otps || [],
        attendances: prismaEventAttendee.user.attendances || [],
        segmentAttendances: prismaEventAttendee.user.segmentAttendances || [],
        hostedEvents: prismaEventAttendee.user.hostedEvents || [],
      },
      event: {
        ...prismaEventAttendee.event,
        date: prismaEventAttendee.event.date,
        host: {
          ...prismaEventAttendee.event.host,
          dateOfBirth: prismaEventAttendee.event.host.dateOfBirth,
          lastLogin: prismaEventAttendee.event.host.lastLogin?.toISOString() || null,
          allergies: prismaEventAttendee.event.host.allergies || [],
          otps: prismaEventAttendee.event.host.otps || [],
          attendances: prismaEventAttendee.event.host.attendances || [],
          segmentAttendances: prismaEventAttendee.event.host.segmentAttendances || [],
          hostedEvents: prismaEventAttendee.event.host.hostedEvents || [],
        },
        segments: prismaEventAttendee.event.segments || [],
        attendees: prismaEventAttendee.event.attendees || [],
      },
    };
  }
}
