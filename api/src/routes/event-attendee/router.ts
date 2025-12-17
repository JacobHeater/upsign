import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';

const router = Router();

router.post('/event-attendee', (req, res) => {
  // Handle event attendee creation
  const response: IApiResponse<null> = { success: true };
  res.status(201).json(response);
});

router.get('/event-attendee/:id', (req, res) => {
  // Handle fetching an event attendee by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.get('/event-attendee', (req, res) => {
  // Handle fetching all event attendees
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.put('/event-attendee/:id', (req, res) => {
  // Handle updating an event attendee by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.delete('/event-attendee/:id', (req, res) => {
  // Handle deleting an event attendee by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

export default router;
