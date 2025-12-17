import { EventSegment } from '../../schema/event-segment';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventSegmentRepository extends PrismaRepositoryBase<EventSegment> {
  async getByIdAsync(id: string): Promise<EventSegment | null> {
    const eventSegment = await this.prisma.eventSegment.findUnique({
      where: { id },
      include: { attendees: true },
    });
    return eventSegment as EventSegment | null;
  }

  async getAllAsync(): Promise<EventSegment[]> {
    const eventSegments = await this.prisma.eventSegment.findMany({
      include: { attendees: true },
    });
    return eventSegments as EventSegment[];
  }

  async createAsync(item: EventSegment): Promise<EventSegment> {
    const { id, attendees, ...data } = item;
    const eventSegment = await this.prisma.eventSegment.create({
      data,
      include: { attendees: true },
    });
    return eventSegment as EventSegment;
  }

  async updateAsync(id: string, item: EventSegment): Promise<EventSegment | null> {
    const { id: _, attendees, ...data } = item;
    try {
      const eventSegment = await this.prisma.eventSegment.update({
        where: { id },
        data,
        include: { attendees: true },
      });
      return eventSegment as EventSegment;
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventSegment.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
