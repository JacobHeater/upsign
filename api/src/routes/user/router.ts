import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';

const router = Router();

router.post('/user', (req, res) => {
  // Handle user creation
  const response: IApiResponse<null> = { success: true };
  res.status(201).json(response);
});

router.get('/user/:id', (req, res) => {
  // Handle fetching a user by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.get('/user', (req, res) => {
  // Handle fetching all users
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.put('/user/:id', (req, res) => {
  // Handle updating a user by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.delete('/user/:id', (req, res) => {
  // Handle deleting a user by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

export default router;
