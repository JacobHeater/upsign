import { EventInvitation } from 'common/schema';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaEventInvitationRepository extends PrismaRepositoryBase<EventInvitation> {
  async getByIdAsync(id: string): Promise<EventInvitation | null> {
    const invitation = await this.prisma.eventInvitation.findUnique({
      where: { id },
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return invitation ? this.mapToEventInvitation(invitation) : null;
  }

  async getAllAsync(): Promise<EventInvitation[]> {
    const invitations = await this.prisma.eventInvitation.findMany({
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return invitations.map(this.mapToEventInvitation);
  }

  async createAsync(item: EventInvitation): Promise<EventInvitation> {
    const { id, sender, recipient, event, createdAt, updatedAt, ...rest } = item;
    const data = { ...rest, senderId: sender.id, recipientId: recipient.id, eventId: event.id };
    const invitation = await this.prisma.eventInvitation.create({
      data,
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return this.mapToEventInvitation(invitation);
  }

  async updateAsync(id: string, item: EventInvitation): Promise<EventInvitation | null> {
    const { id: _, sender, recipient, event, ...rest } = item;
    const data = { ...rest, senderId: sender.id, recipientId: recipient.id, eventId: event.id };
    try {
      const invitation = await this.prisma.eventInvitation.update({
        where: { id },
        data,
        include: {
          sender: { include: { allergies: true } },
          recipient: { include: { allergies: true } },
          event: true,
        },
      });
      return this.mapToEventInvitation(invitation);
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.eventInvitation.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getByRecipientIdAsync(recipientId: string): Promise<EventInvitation[]> {
    const invitations = await this.prisma.eventInvitation.findMany({
      where: { recipientId },
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return invitations.map(this.mapToEventInvitation);
  }

  async getBySenderIdAsync(senderId: string): Promise<EventInvitation[]> {
    const invitations = await this.prisma.eventInvitation.findMany({
      where: { senderId },
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return invitations.map(this.mapToEventInvitation);
  }

  async getByEventIdAsync(eventId: string): Promise<EventInvitation[]> {
    const invitations = await this.prisma.eventInvitation.findMany({
      where: { eventId },
      include: {
        sender: { include: { allergies: true } },
        recipient: { include: { allergies: true } },
        event: true,
      },
    });
    return invitations.map(this.mapToEventInvitation);
  }

  private mapToEventInvitation(prismaInvitation: any): EventInvitation {
    return {
      ...prismaInvitation,
      sender: {
        ...prismaInvitation.sender,
        dateOfBirth: prismaInvitation.sender.dateOfBirth,
        lastLogin:
          prismaInvitation.sender.lastLogin instanceof Date
            ? prismaInvitation.sender.lastLogin.toISOString()
            : prismaInvitation.sender.lastLogin || null,
        otps: (prismaInvitation.sender.otps || []).map((otp: any) => ({
          ...otp,
          expiry: otp.expiry.toISOString(),
        })),
      },
      recipient: {
        ...prismaInvitation.recipient,
        dateOfBirth: prismaInvitation.recipient.dateOfBirth,
        lastLogin:
          prismaInvitation.recipient.lastLogin instanceof Date
            ? prismaInvitation.recipient.lastLogin.toISOString()
            : prismaInvitation.recipient.lastLogin || null,
        otps: (prismaInvitation.recipient.otps || []).map((otp: any) => ({
          ...otp,
          expiry: otp.expiry.toISOString(),
        })),
      },
    };
  }
}
