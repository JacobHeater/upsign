import { EventChatMessage } from 'common';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventChatMessageRepository extends PrismaRepositoryBase<EventChatMessage> {
  async getByIdAsync(id: string): Promise<EventChatMessage | null> {
    const message = await this.prisma.eventChatMessage.findUnique({
      where: { id },
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true } },
        reactions: {
          include: {
            user: { include: { allergies: true } },
          },
        },
      },
    });
    return message ? this.mapToEventChatMessage(message) : null;
  }

  async getAllAsync(): Promise<EventChatMessage[]> {
    const messages = await this.prisma.eventChatMessage.findMany({
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true } },
        reactions: {
          include: {
            user: { include: { allergies: true } },
          },
        },
      },
    });
    return messages.map(this.mapToEventChatMessage);
  }

  async getByEventIdAsync(eventId: string): Promise<EventChatMessage[]> {
    const messages = await this.prisma.eventChatMessage.findMany({
      where: { eventId },
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true } },
        reactions: {
          include: {
            user: { include: { allergies: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map(this.mapToEventChatMessage);
  }

  async createAsync(item: EventChatMessage): Promise<EventChatMessage> {
    const { id, user, event, reactions, createdAt, updatedAt, ...rest } = item;
    const data = { ...rest, userId: user.id, eventId: event.id };
    const message = await this.prisma.eventChatMessage.create({
      data,
      include: {
        user: { include: { allergies: true } },
        event: { include: { host: true } },
        reactions: {
          include: {
            user: { include: { allergies: true } },
          },
        },
      },
    });
    return this.mapToEventChatMessage(message);
  }

  async updateAsync(id: string, item: EventChatMessage): Promise<EventChatMessage | null> {
    const { id: _, user, event, reactions, createdAt, updatedAt, ...rest } = item;
    const data = { ...rest };
    try {
      const message = await this.prisma.eventChatMessage.update({
        where: { id },
        data,
        include: {
          user: { include: { allergies: true } },
          event: { include: { host: true } },
          reactions: {
            include: {
              user: { include: { allergies: true } },
            },
          },
        },
      });
      return this.mapToEventChatMessage(message);
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventChatMessage.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEventChatMessage(prismaMessage: any): EventChatMessage {
    return {
      ...prismaMessage,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
      user: {
        ...prismaMessage.user,
        dateOfBirth: prismaMessage.user.dateOfBirth?.toISOString() || null,
        lastLogin: prismaMessage.user.lastLogin?.toISOString() || null,
        createdAt: prismaMessage.user.createdAt,
        updatedAt: prismaMessage.user.updatedAt,
        otps: (prismaMessage.user.otps || []).map((otp: any) => ({
          ...otp,
          expiry: otp.expiry.toISOString(),
          createdAt: otp.createdAt,
          updatedAt: otp.updatedAt,
        })),
      },
      event: {
        ...prismaMessage.event,
        date: prismaMessage.event.date,
        createdAt: prismaMessage.event.createdAt,
        updatedAt: prismaMessage.event.updatedAt,
        host: {
          ...prismaMessage.event.host,
          dateOfBirth: prismaMessage.event.host.dateOfBirth?.toISOString() || null,
          lastLogin: prismaMessage.event.host.lastLogin?.toISOString() || null,
          createdAt: prismaMessage.event.host.createdAt,
          updatedAt: prismaMessage.event.host.updatedAt,
          otps: (prismaMessage.event.host.otps || []).map((otp: any) => ({
            ...otp,
            expiry: otp.expiry.toISOString(),
            createdAt: otp.createdAt,
            updatedAt: otp.updatedAt,
          })),
        },
        segments: prismaMessage.event.segments || [],
        attendees: prismaMessage.event.attendees || [],
      },
      reactions: (prismaMessage.reactions || []).map((reaction: any) => ({
        ...reaction,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
        user: {
          ...reaction.user,
          dateOfBirth: reaction.user.dateOfBirth?.toISOString() || null,
          lastLogin: reaction.user.lastLogin?.toISOString() || null,
          createdAt: reaction.user.createdAt,
          updatedAt: reaction.user.updatedAt,
          otps: (reaction.user.otps || []).map((otp: any) => ({
            ...otp,
            expiry: otp.expiry.toISOString(),
            createdAt: otp.createdAt,
            updatedAt: otp.updatedAt,
          })),
        },
      })),
    };
  }
}
