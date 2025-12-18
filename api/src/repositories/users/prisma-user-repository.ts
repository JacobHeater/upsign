import { User } from 'common/schema';
import { PrismaRepositoryBase } from '../prisma-repository-base';
import logger from '../../utils/logger';

export class PrismaUserRepository extends PrismaRepositoryBase<User> {
  async getByIdAsync(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        allergies: true,
        otps: true,
        attendances: { include: { segment: true, contributions: true } },
        hostedEvents: { include: { segments: true } },
        sentInvitations: { include: { sender: true, recipient: true } },
        receivedInvitations: { include: { sender: true, recipient: true } },
      },
    });
    return user ? this.mapToUser(user) : null;
  }

  async getAllAsync(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: {
        allergies: true,
        otps: true,
        attendances: { include: { segment: true, contributions: true } },
        hostedEvents: { include: { segments: true } },
        sentInvitations: { include: { sender: true, recipient: true } },
        receivedInvitations: { include: { sender: true, recipient: true } },
      },
    });
    return users.map(this.mapToUser);
  }

  async createAsync(item: User): Promise<User> {
    const { allergies, otps, attendances, hostedEvents, ...userData } = item;
    const data = {
      ...userData,
      dateOfBirth: new Date(userData.dateOfBirth),
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
    };
    const user = await this.prisma.user.create({
      data: {
        ...data,
        allergies: {
          create: allergies?.map((a) => ({ allergy: a.allergy })) || [],
        },
      },
      include: {
        allergies: true,
        otps: true,
        attendances: { include: { segment: true, contributions: true } },
        hostedEvents: { include: { segments: true } },
        sentInvitations: { include: { sender: true, recipient: true } },
        receivedInvitations: { include: { sender: true, recipient: true } },
      },
    });
    return this.mapToUser(user);
  }

  async updateAsync(id: string, item: User): Promise<User | null> {
    const { id: _, allergies, otps, attendances, hostedEvents, ...userData } = item;
    const data = {
      ...userData,
    };
    logger.info('Updating user', { userId: id, item });
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      });
      if (allergies !== undefined) {
        await this.prisma.userAllergy.deleteMany({ where: { userId: id } });
        await this.prisma.userAllergy.createMany({
          data: allergies.map((a) => ({ userId: id, allergy: a.allergy })),
        });
      }
      // Refetch with includes
      const updatedUser = await this.prisma.user.findUnique({
        where: { id },
        include: {
          allergies: true,
          otps: true,
          attendances: { include: { segment: true, contributions: true } },
          hostedEvents: { include: { segments: true } },
          sentInvitations: { include: { sender: true, recipient: true } },
          receivedInvitations: { include: { sender: true, recipient: true } },
        },
      });
      return this.mapToUser(updatedUser);
    } catch (error) {
      logger.error('Error updating user', error, { userId: id });
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getByPhoneNumberAsync(phoneNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });
    return user ? this.mapToUser(user) : null;
  }

  private mapToUser(prismaUser: any): User {
    if (!prismaUser) return prismaUser;

    return {
      ...prismaUser,
      dateOfBirth: prismaUser.dateOfBirth,
      lastLogin: prismaUser.lastLogin?.toISOString() || null,
      otps: (prismaUser.otps || []).map((otp: any) => ({
        ...otp,
        expiry: otp.expiry.toISOString(),
      })),
      attendances: (prismaUser.attendances || []).map((attendance: any) => ({
        ...attendance,
        user: this.mapToUser(attendance.user),
        segment: {
          ...attendance.segment,
          event: attendance.segment.event
            ? {
                ...attendance.segment.event,
                date: attendance.segment.event.date.toISOString().split('T')[0],
                host: this.mapToUser(attendance.segment.event.host),
              }
            : undefined,
        },
        contributions: attendance.contributions || [],
      })),
      hostedEvents: (prismaUser.hostedEvents || []).map((event: any) => ({
        ...event,
        date: event.date,
        host: this.mapToUser(event.host),
        segments: (event.segments || []).map((segment: any) => ({
          ...segment,
          attendees: (segment.attendees || []).map((attendee: any) => ({
            ...attendee,
            user: this.mapToUser(attendee.user),
            contributions: attendee.contributions || [],
          })),
        })),
      })),
      sentInvitations: prismaUser.sentInvitations || [],
      receivedInvitations: prismaUser.receivedInvitations || [],
    };
  }
}
