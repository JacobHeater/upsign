import { EventSegmentAttendee } from 'common';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventSegmentAttendeeRepository extends PrismaRepositoryBase<EventSegmentAttendee> {
  async getByIdAsync(id: string): Promise<EventSegmentAttendee | null> {
    const eventSegmentAttendee = await this.prisma.eventSegmentAttendee.findUnique({
      where: { id },
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return eventSegmentAttendee ? this.mapToEventSegmentAttendee(eventSegmentAttendee) : null;
  }

  async getAllAsync(): Promise<EventSegmentAttendee[]> {
    const eventSegmentAttendees = await this.prisma.eventSegmentAttendee.findMany({
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return eventSegmentAttendees.map(this.mapToEventSegmentAttendee);
  }

  async createAsync(item: EventSegmentAttendee): Promise<EventSegmentAttendee> {
    const { id, user, segment, contributions, createdAt, updatedAt, ...data } = item;
    const eventSegmentAttendee = await this.prisma.eventSegmentAttendee.create({
      data,
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return this.mapToEventSegmentAttendee(eventSegmentAttendee);
  }

  async updateAsync(id: string, item: EventSegmentAttendee): Promise<EventSegmentAttendee | null> {
    const { id: _, user, segment, contributions, createdAt, updatedAt, ...data } = item;
    try {
      const eventSegmentAttendee = await this.prisma.eventSegmentAttendee.update({
        where: { id },
        data,
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      return this.mapToEventSegmentAttendee(eventSegmentAttendee);
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      // First delete all contributions for this attendee
      await this.prisma.eventSegmentAttendeeContribution.deleteMany({
        where: { eventSegmentAttendeeId: id },
      });

      // Then delete the attendee
      await this.prisma.eventSegmentAttendee.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEventSegmentAttendee(prismaEventSegmentAttendee: any): EventSegmentAttendee {
    return {
      ...prismaEventSegmentAttendee,
      user: {
        ...prismaEventSegmentAttendee.user,
        dateOfBirth: prismaEventSegmentAttendee.user.dateOfBirth,
        lastLogin: prismaEventSegmentAttendee.user.lastLogin
          ? prismaEventSegmentAttendee.user.lastLogin.toISOString()
          : null,
      },
    };
  }
}
