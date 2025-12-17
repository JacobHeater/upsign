import { Event } from '../../schema/event';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventRepository extends PrismaRepositoryBase<Event> {
  async getByIdAsync(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { segments: true },
    });
    return event as Event | null;
  }

  async getAllAsync(): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
      include: { segments: true },
    });
    return events as Event[];
  }

  async createAsync(item: Event): Promise<Event> {
    const { id, segments, ...data } = item;
    const event = await this.prisma.event.create({
      data,
      include: { segments: true },
    });
    return event as Event;
  }

  async updateAsync(id: string, item: Event): Promise<Event | null> {
    const { id: _, segments, ...data } = item;
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data,
        include: { segments: true },
      });
      return event as Event;
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.event.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
