import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';
import { PrismaUserRepository } from '../../repositories/users/prisma-user-repository';
import { AuthRequest } from '../../middleware/auth';
import logger from '../../utils/logger';

const router = Router();

router.get('/me', async (req: AuthRequest, res) => {
  try {
    logger.info('Fetching current user', { userId: req.user!.userId });
    const userRepository = new PrismaUserRepository();
    const user = await userRepository.getByIdAsync(req.user!.userId);
    logger.info(
      `User found: ${user?.id}, verified: ${user?.verified}, lastLogin: ${user?.lastLogin}`,
      { userId: req.user!.userId }
    );
    const response: IApiResponse<typeof user> = { success: true, data: user };
    res.json(response);
  } catch (error) {
    logger.error('Error fetching current user', error, { userId: req.user!.userId });
    const response: IApiResponse<null> = { success: false, error: 'User not found' };
    res.status(404).json(response);
  }
});

router.post('/', (req, res) => {
  // Handle user creation
  const response: IApiResponse<null> = { success: true };
  res.status(201).json(response);
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    logger.info('Fetching user by ID', { userId: id, requesterId: req.user!.userId });
    const userRepository = new PrismaUserRepository();
    const user = await userRepository.getByIdAsync(id);
    if (!user) {
      const response: IApiResponse<null> = { success: false, error: 'User not found' };
      return res.status(404).json(response);
    }
    const response: IApiResponse<typeof user> = { success: true, data: user };
    res.json(response);
  } catch (error) {
    logger.error('Error fetching user by ID', error, { userId: req.params.id });
    const response: IApiResponse<null> = { success: false, error: 'Failed to fetch user' };
    res.status(500).json(response);
  }
});

router.get('/', (req, res) => {
  // Handle fetching all users
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    logger.info('Updating user', { userId: req.params.id, requesterId: req.user!.userId });
    const { id } = req.params;
    const userRepository = new PrismaUserRepository();

    // Check if user is updating themselves or is admin (for now, only self-update)
    if (req.user!.userId !== id) {
      const response: IApiResponse<null> = { success: false, error: 'Unauthorized' };
      return res.status(403).json(response);
    }

    const updatedUser = await userRepository.updateAsync(id, req.body);
    if (!updatedUser) {
      const response: IApiResponse<null> = { success: false, error: 'User not found' };
      return res.status(404).json(response);
    }

    const response: IApiResponse<typeof updatedUser> = { success: true, data: updatedUser };
    res.json(response);
  } catch (error) {
    logger.error('Error updating user', error, { userId: req.params.id });
    const response: IApiResponse<null> = { success: false, error: 'Failed to update user' };
    res.status(500).json(response);
  }
});

router.delete('/:id', (req, res) => {
  // Handle deleting a user by ID
  res.status(204).send();
});

export default router;
