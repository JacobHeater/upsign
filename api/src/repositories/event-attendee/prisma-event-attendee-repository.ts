import { EventAttendee } from '../../schema/event-attendee';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventAttendeeRepository extends PrismaRepositoryBase<EventAttendee> {
  async getByIdAsync(id: string): Promise<EventAttendee | null> {
    const eventAttendee = await this.prisma.eventAttendee.findUnique({
      where: { id },
      include: { user: true, segment: true, contributions: true },
    });
    return eventAttendee as EventAttendee | null;
  }

  async getAllAsync(): Promise<EventAttendee[]> {
    const eventAttendees = await this.prisma.eventAttendee.findMany({
      include: { user: true, segment: true, contributions: true },
    });
    return eventAttendees as EventAttendee[];
  }

  async createAsync(item: EventAttendee): Promise<EventAttendee> {
    const { id, user, segment, contributions, ...data } = item;
    const eventAttendee = await this.prisma.eventAttendee.create({
      data,
      include: { user: true, segment: true, contributions: true },
    });
    return eventAttendee as EventAttendee;
  }

  async updateAsync(id: string, item: EventAttendee): Promise<EventAttendee | null> {
    const { id: _, user, segment, contributions, ...data } = item;
    try {
      const eventAttendee = await this.prisma.eventAttendee.update({
        where: { id },
        data,
        include: { user: true, segment: true, contributions: true },
      });
      return eventAttendee as EventAttendee;
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
}
