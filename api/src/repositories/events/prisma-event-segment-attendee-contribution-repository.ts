import { EventSegmentAttendeeContribution } from 'common/schema';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventSegmentAttendeeContributionRepository extends PrismaRepositoryBase<EventSegmentAttendeeContribution> {
  async getByIdAsync(id: string): Promise<EventSegmentAttendeeContribution | null> {
    const eventSegmentAttendeeContribution =
      await this.prisma.eventSegmentAttendeeContribution.findUnique({
        where: { id },
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
    return eventSegmentAttendeeContribution
      ? this.mapToEventSegmentAttendeeContribution(eventSegmentAttendeeContribution)
      : null;
  }

  async getAllAsync(): Promise<EventSegmentAttendeeContribution[]> {
    const eventSegmentAttendeeContributions =
      await this.prisma.eventSegmentAttendeeContribution.findMany({
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
    return eventSegmentAttendeeContributions.map(this.mapToEventSegmentAttendeeContribution);
  }

  async createAsync(
    item: EventSegmentAttendeeContribution
  ): Promise<EventSegmentAttendeeContribution> {
    const { id, eventSegmentAttendee, createdAt, updatedAt, ...data } = item;
    const eventSegmentAttendeeContribution =
      await this.prisma.eventSegmentAttendeeContribution.create({
        data,
        include: {
          eventSegmentAttendee: {
            include: { user: true },
          },
        },
      });
    return this.mapToEventSegmentAttendeeContribution(eventSegmentAttendeeContribution);
  }

  async updateAsync(
    id: string,
    item: EventSegmentAttendeeContribution
  ): Promise<EventSegmentAttendeeContribution | null> {
    const { id: _, eventSegmentAttendee, createdAt, updatedAt, ...data } = item;
    try {
      const eventSegmentAttendeeContribution =
        await this.prisma.eventSegmentAttendeeContribution.update({
          where: { id },
          data,
          include: {
            eventSegmentAttendee: {
              include: { user: true },
            },
          },
        });
      return this.mapToEventSegmentAttendeeContribution(eventSegmentAttendeeContribution);
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventSegmentAttendeeContribution.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEventSegmentAttendeeContribution(
    prismaContribution: any
  ): EventSegmentAttendeeContribution {
    return {
      ...prismaContribution,
      eventSegmentAttendee: {
        ...prismaContribution.eventSegmentAttendee,
        user: {
          ...prismaContribution.eventSegmentAttendee.user,
          dateOfBirth: prismaContribution.eventSegmentAttendee.user.dateOfBirth,
          lastLogin: prismaContribution.eventSegmentAttendee.user.lastLogin
            ? prismaContribution.eventSegmentAttendee.user.lastLogin.toISOString()
            : null,
        },
      },
    };
  }
}
