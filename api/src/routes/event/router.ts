import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';

const router = Router();

router.post('/event', (req, res) => {
  // Handle event creation
  const response: IApiResponse<null> = { success: true };
  res.status(201).json(response);
});

router.get('/event/:id', (req, res) => {
  // Handle fetching an event by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.get('/event', (req, res) => {
  // Handle fetching all events
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.put('/event/:id', (req, res) => {
  // Handle updating an event by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.delete('/event/:id', (req, res) => {
  // Handle deleting an event by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

export default router;
