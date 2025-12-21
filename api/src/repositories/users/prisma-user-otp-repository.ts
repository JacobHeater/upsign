import { UserOtp } from 'common';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaUserOtpRepository extends PrismaRepositoryBase<UserOtp> {
  async getByIdAsync(id: string): Promise<UserOtp | null> {
    const userOtp = await this.prisma.userOtp.findUnique({
      where: { id },
      include: { user: true },
    });
    return userOtp as any;
  }

  async getAllAsync(): Promise<UserOtp[]> {
    const userOtps = await this.prisma.userOtp.findMany({
      include: { user: true },
    });
    return userOtps as any;
  }

  async createAsync(item: any): Promise<UserOtp> {
    const userOtp = await this.prisma.userOtp.create({
      data: item,
      include: { user: true },
    });
    return userOtp as any;
  }

  async updateAsync(id: string, item: any): Promise<UserOtp | null> {
    try {
      const userOtp = await this.prisma.userOtp.update({
        where: { id },
        data: item,
        include: { user: true },
      });
      return userOtp as any;
    } catch {
      return null;
    }
  }

  async deleteAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.userOtp.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async createOtpAsync(userId: string, otp: string): Promise<any> {
    const expiry = new Date(Date.now() + 3 * 60 * 1000);
    const userOtp = await this.prisma.userOtp.create({
      data: {
        userId,
        otp,
        expiry,
        consumed: false,
      },
      include: {
        user: true,
      },
    });
    return userOtp;
  }

  async getValidOtpAsync(userId: string, otp: string): Promise<any> {
    const userOtp = await this.prisma.userOtp.findFirst({
      where: {
        userId,
        otp,
        expiry: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    return userOtp;
  }

  async deleteOtpAsync(id: string): Promise<boolean> {
    try {
      await this.prisma.userOtp.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteExpiredOtpsAsync(): Promise<number> {
    const result = await this.prisma.userOtp.deleteMany({
      where: {
        expiry: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}
