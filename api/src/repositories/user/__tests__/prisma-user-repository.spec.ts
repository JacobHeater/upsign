import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaUserRepository } from '../prisma-user-repository';
import { User } from '../../../schema/user';

const mockUserFindUnique = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: mockUserFindUnique,
      findMany: mockUserFindMany,
      create: mockUserCreate,
      update: mockUserUpdate,
      delete: mockUserDelete,
    },
  })),
}));

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    repository = new PrismaUserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByIdAsync', () => {
    it('should return a user when found', async () => {
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      (mockUserFindUnique as any).mockResolvedValue(mockUser);

      const result = await repository.getByIdAsync('1');

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (mockUserFindUnique as any).mockResolvedValue(null);

      const result = await repository.getByIdAsync('1');

      expect(result).toBeNull();
    });
  });

  describe('getAllAsync', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          allergies: [],
          email: 'john.doe@example.com',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '1234567890',
          verified: true,
          locked: false,
          lastLogin: null,
        },
      ];

      (mockUserFindMany as any).mockResolvedValue(mockUsers);

      const result = await repository.getAllAsync();

      expect(mockUserFindMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('createAsync', () => {
    it('should create and return a user', async () => {
      const inputUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        allergies: [],
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: false,
        locked: false,
        lastLogin: null,
      };

      const createdUser = { ...inputUser, id: 'generated-id' };

      (mockUserCreate as any).mockResolvedValue(createdUser);

      const result = await repository.createAsync(inputUser);

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          allergies: [],
          email: 'john.doe@example.com',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '1234567890',
          verified: false,
          locked: false,
          lastLogin: null,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateAsync', () => {
    it('should update and return the user', async () => {
      const inputUser: User = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        allergies: [],
        email: 'jane.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      (mockUserUpdate as any).mockResolvedValue(inputUser);

      const result = await repository.updateAsync('1', inputUser);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          allergies: [],
          email: 'jane.doe@example.com',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '1234567890',
          verified: true,
          locked: false,
          lastLogin: null,
        },
      });
      expect(result).toEqual(inputUser);
    });

    it('should return null when update fails', async () => {
      (mockUserUpdate as any).mockRejectedValue(new Error('Not found'));

      const inputUser: User = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        allergies: [],
        email: 'jane.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890',
        verified: true,
        locked: false,
        lastLogin: null,
      };

      const result = await repository.updateAsync('1', inputUser);

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete the user and return true', async () => {
      (mockUserDelete as any).mockResolvedValue({} as any);

      const result = await repository.deleteAsync('1');

      expect(mockUserDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      (mockUserDelete as any).mockRejectedValue(new Error('Not found'));

      const result = await repository.deleteAsync('1');

      expect(result).toBe(false);
    });
  });
});
