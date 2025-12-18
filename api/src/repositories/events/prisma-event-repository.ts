import { Event } from 'common/schema';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventRepository extends PrismaRepositoryBase<Event> {
  async getByIdAsync(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        segments: {
          include: {
            attendees: {
              include: {
                user: { include: { allergies: true } },
                contributions: true,
              },
            },
          },
        },
        host: { include: { allergies: true } },
      },
    });
    return event ? this.mapToEvent(event) : null;
  }

  async getAllAsync(): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
      include: {
        segments: {
          include: {
            attendees: {
              include: {
                user: { include: { allergies: true } },
                contributions: true,
              },
            },
          },
        },
        host: { include: { allergies: true } },
      },
    });
    return events.map(this.mapToEvent);
  }

  async createAsync(item: Event): Promise<Event> {
    const { id, segments, host, ...rest } = item;
    const data = { ...rest, hostId: host.id };
    const event = await this.prisma.event.create({
      data,
      include: {
        segments: {
          include: {
            attendees: {
              include: {
                user: { include: { allergies: true } },
                contributions: true,
              },
            },
          },
        },
        host: { include: { allergies: true } },
      },
    });
    return this.mapToEvent(event);
  }

  async updateAsync(id: string, item: Event): Promise<Event | null> {
    const { id: _, segments, host, ...rest } = item;
    const data = { ...rest, date: new Date(rest.date), hostId: host.id };
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data,
        include: {
          segments: {
            include: {
              attendees: {
                include: {
                  user: { include: { allergies: true } },
                  contributions: true,
                },
              },
            },
          },
          host: { include: { allergies: true } },
        },
      });
      return this.mapToEvent(event);
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

  private mapToEvent(prismaEvent: any): Event {
    return {
      ...prismaEvent,
      date: prismaEvent.date, // Keep as Date
      host: {
        ...prismaEvent.host,
        dateOfBirth: prismaEvent.host.dateOfBirth,
        lastLogin:
          prismaEvent.host.lastLogin instanceof Date
            ? prismaEvent.host.lastLogin.toISOString()
            : prismaEvent.host.lastLogin || null,
        otps: (prismaEvent.host.otps || []).map((otp: any) => ({
          ...otp,
          expiry: otp.expiry.toISOString(),
        })),
      },
      segments: (prismaEvent.segments || []).map((segment: any) => ({
        ...segment,
        attendees: (segment.attendees || []).map((attendee: any) => ({
          ...attendee,
          user: {
            ...attendee.user,
            dateOfBirth: attendee.user.dateOfBirth,
            lastLogin: attendee.user.lastLogin?.toISOString() || null,
            otps: (attendee.user.otps || []).map((otp: any) => ({
              ...otp,
              expiry: otp.expiry.toISOString(),
            })),
          },
          contributions: attendee.contributions || [],
        })),
      })),
    };
  }
}
