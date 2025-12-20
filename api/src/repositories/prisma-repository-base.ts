import { PrismaClient } from '@prisma/client';
import { IRepository } from './irepository';
import { ISchemaTable } from 'common/schema';

export abstract class PrismaRepositoryBase<T extends ISchemaTable> implements IRepository<T> {
  constructor(protected readonly prisma: PrismaClient = new PrismaClient()) {}

  abstract getByIdAsync(id: string): Promise<T | null>;
  abstract getAllAsync(): Promise<T[]>;
  abstract createAsync(item: T): Promise<T>;
  abstract updateAsync(id: string, item: T): Promise<T | null>;
  abstract deleteAsync(id: string): Promise<boolean>;
}
