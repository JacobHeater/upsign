import { EventAttendee } from 'common/schema';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventAttendeeRepository extends PrismaRepositoryBase<EventAttendee> {
  async getByIdAsync(id: string): Promise<EventAttendee | null> {
    const eventAttendee = await this.prisma.eventAttendee.findUnique({
      where: { id },
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return eventAttendee ? this.mapToEventAttendee(eventAttendee) : null;
  }

  async getAllAsync(): Promise<EventAttendee[]> {
    const eventAttendees = await this.prisma.eventAttendee.findMany({
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return eventAttendees.map(this.mapToEventAttendee);
  }

  async createAsync(item: EventAttendee): Promise<EventAttendee> {
    const { id, user, segment, contributions, ...data } = item;
    const eventAttendee = await this.prisma.eventAttendee.create({
      data,
      include: {
        user: { include: { allergies: true } },
        segment: { include: { event: true } },
        contributions: true,
      },
    });
    return this.mapToEventAttendee(eventAttendee);
  }

  async updateAsync(id: string, item: EventAttendee): Promise<EventAttendee | null> {
    const { id: _, user, segment, contributions, ...data } = item;
    try {
      const eventAttendee = await this.prisma.eventAttendee.update({
        where: { id },
        data,
        include: {
          user: { include: { allergies: true } },
          segment: { include: { event: true } },
          contributions: true,
        },
      });
      return this.mapToEventAttendee(eventAttendee);
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventAttendee.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEventAttendee(prismaEventAttendee: any): EventAttendee {
    return {
      ...prismaEventAttendee,
      user: {
        ...prismaEventAttendee.user,
        dateOfBirth: prismaEventAttendee.user.dateOfBirth,
        lastLogin: prismaEventAttendee.user.lastLogin ? prismaEventAttendee.user.lastLogin.toISOString() : null,
      },
    };
  }
}
