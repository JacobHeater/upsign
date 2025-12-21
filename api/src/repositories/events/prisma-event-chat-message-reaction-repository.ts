import { EventChatMessageReaction } from 'common';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventChatMessageReactionRepository extends PrismaRepositoryBase<EventChatMessageReaction> {
  async getByIdAsync(id: string): Promise<EventChatMessageReaction | null> {
    const reaction = await this.prisma.eventChatMessageReaction.findUnique({
      where: { id },
      include: {
        user: { include: { allergies: true } },
        message: {
          include: {
            user: { include: { allergies: true } },
            event: true,
            reactions: {
              include: {
                user: { include: { allergies: true } },
              },
            },
          },
        },
      },
    });
    return reaction ? this.mapToEventChatMessageReaction(reaction) : null;
  }

  async getAllAsync(): Promise<EventChatMessageReaction[]> {
    const reactions = await this.prisma.eventChatMessageReaction.findMany({
      include: {
        user: { include: { allergies: true } },
        message: {
          include: {
            user: { include: { allergies: true } },
            event: true,
            reactions: {
              include: {
                user: { include: { allergies: true } },
              },
            },
          },
        },
      },
    });
    return reactions.map(this.mapToEventChatMessageReaction);
  }

  async getByMessageIdAsync(messageId: string): Promise<EventChatMessageReaction[]> {
    const reactions = await this.prisma.eventChatMessageReaction.findMany({
      where: { messageId },
      include: {
        user: { include: { allergies: true } },
        message: {
          include: {
            user: { include: { allergies: true } },
            event: { include: { host: true } },
            reactions: {
              include: {
                user: { include: { allergies: true } },
              },
            },
          },
        },
      },
    });
    return reactions.map(this.mapToEventChatMessageReaction);
  }

  async createAsync(item: EventChatMessageReaction): Promise<EventChatMessageReaction> {
    const { id, user, message, createdAt, updatedAt, ...rest } = item;
    const data = { ...rest, userId: user.id, messageId: message.id };
    const reaction = await this.prisma.eventChatMessageReaction.create({
      data,
      include: {
        user: { include: { allergies: true } },
        message: {
          include: {
            user: { include: { allergies: true } },
            event: { include: { host: true } },
            reactions: {
              include: {
                user: { include: { allergies: true } },
              },
            },
          },
        },
      },
    });
    return this.mapToEventChatMessageReaction(reaction);
  }

  async updateAsync(
    id: string,
    item: EventChatMessageReaction
  ): Promise<EventChatMessageReaction | null> {
    const { id: _, user, message, createdAt, updatedAt, ...rest } = item;
    const data = { ...rest };
    try {
      const reaction = await this.prisma.eventChatMessageReaction.update({
        where: { id },
        data,
        include: {
          user: { include: { allergies: true } },
          message: {
            include: {
              user: { include: { allergies: true } },
              event: true,
              reactions: {
                include: {
                  user: { include: { allergies: true } },
                },
              },
            },
          },
        },
      });
      return this.mapToEventChatMessageReaction(reaction);
    } catch {
      return null;
    }
  }

  private mapToEventChatMessageReaction(prismaReaction: any): EventChatMessageReaction {
    return {
      ...prismaReaction,
      createdAt: prismaReaction.createdAt,
      updatedAt: prismaReaction.updatedAt,
      user: {
        ...prismaReaction.user,
        dateOfBirth: prismaReaction.user.dateOfBirth?.toISOString() || null,
        lastLogin: prismaReaction.user.lastLogin?.toISOString() || null,
        createdAt: prismaReaction.user.createdAt,
        updatedAt: prismaReaction.user.updatedAt,
        otps: (prismaReaction.user.otps || []).map((otp: any) => ({
          ...otp,
          expiry: otp.expiry.toISOString(),
          createdAt: otp.createdAt,
          updatedAt: otp.updatedAt,
        })),
      },
      message: {
        ...prismaReaction.message,
        createdAt: prismaReaction.message.createdAt,
        updatedAt: prismaReaction.message.updatedAt,
        user: {
          ...prismaReaction.message.user,
          dateOfBirth: prismaReaction.message.user.dateOfBirth?.toISOString() || null,
          lastLogin: prismaReaction.message.user.lastLogin?.toISOString() || null,
          createdAt: prismaReaction.message.user.createdAt,
          updatedAt: prismaReaction.message.user.updatedAt,
          otps: (prismaReaction.message.user.otps || []).map((otp: any) => ({
            ...otp,
            expiry: otp.expiry.toISOString(),
            createdAt: otp.createdAt,
            updatedAt: otp.updatedAt,
          })),
        },
        event: {
          ...prismaReaction.message.event,
          date: prismaReaction.message.event.date,
          createdAt: prismaReaction.message.event.createdAt,
          updatedAt: prismaReaction.message.event.updatedAt,
          host: {
            ...prismaReaction.message.event.host,
            dateOfBirth: prismaReaction.message.event.host.dateOfBirth?.toISOString() || null,
            lastLogin: prismaReaction.message.event.host.lastLogin?.toISOString() || null,
            createdAt: prismaReaction.message.event.host.createdAt,
            updatedAt: prismaReaction.message.event.host.updatedAt,
            otps: (prismaReaction.message.event.host.otps || []).map((otp: any) => ({
              ...otp,
              expiry: otp.expiry.toISOString(),
              createdAt: otp.createdAt,
              updatedAt: otp.updatedAt,
            })),
          },
          segments: prismaReaction.message.event.segments || [],
          attendees: prismaReaction.message.event.attendees || [],
        },
        reactions: (prismaReaction.message.reactions || []).map((r: any) => ({
          ...r,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: {
            ...r.user,
            dateOfBirth: r.user.dateOfBirth?.toISOString() || null,
            lastLogin: r.user.lastLogin?.toISOString() || null,
            createdAt: r.user.createdAt,
            updatedAt: r.user.updatedAt,
            otps: (r.user.otps || []).map((otp: any) => ({
              ...otp,
              expiry: otp.expiry.toISOString(),
              createdAt: otp.createdAt,
              updatedAt: otp.updatedAt,
            })),
          },
        })),
      },
    };
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventChatMessageReaction.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
