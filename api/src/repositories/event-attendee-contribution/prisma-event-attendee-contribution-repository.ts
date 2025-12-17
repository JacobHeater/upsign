import { EventAttendeeContribution } from '../../schema/event-attendee-contribution';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventAttendeeContributionRepository extends PrismaRepositoryBase<EventAttendeeContribution> {
  async getByIdAsync(id: string): Promise<EventAttendeeContribution | null> {
    const eventAttendeeContribution = await this.prisma.eventAttendeeContribution.findUnique({
      where: { id },
      include: { attendee: true },
    });
    return eventAttendeeContribution as EventAttendeeContribution | null;
  }

  async getAllAsync(): Promise<EventAttendeeContribution[]> {
    const eventAttendeeContributions = await this.prisma.eventAttendeeContribution.findMany({
      include: { attendee: true },
    });
    return eventAttendeeContributions as EventAttendeeContribution[];
  }

  async createAsync(item: EventAttendeeContribution): Promise<EventAttendeeContribution> {
    const { id, attendee, ...data } = item;
    const eventAttendeeContribution = await this.prisma.eventAttendeeContribution.create({
      data,
      include: { attendee: true },
    });
    return eventAttendeeContribution as EventAttendeeContribution;
  }

  async updateAsync(
    id: string,
    item: EventAttendeeContribution
  ): Promise<EventAttendeeContribution | null> {
    const { id: _, attendee, ...data } = item;
    try {
      const eventAttendeeContribution = await this.prisma.eventAttendeeContribution.update({
        where: { id },
        data,
        include: { attendee: true },
      });
      return eventAttendeeContribution as EventAttendeeContribution;
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventAttendeeContribution.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
