import { User } from '../../schema/user';
import { PrismaRepositoryBase } from '../prisma-repository-base';

export class PrismaUserRepository extends PrismaRepositoryBase<User> {
  async getByIdAsync(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user as User | null;
  }

  async getAllAsync(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users as User[];
  }

  async createAsync(item: User): Promise<User> {
    const { id, ...data } = item;
    const user = await this.prisma.user.create({
      data,
    });
    return user as User;
  }

  async updateAsync(id: string, item: User): Promise<User | null> {
    const { id: _, ...data } = item;
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return user as User;
    } catch {
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
}
