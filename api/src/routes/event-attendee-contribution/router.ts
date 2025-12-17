import { Router } from 'express';
import { IApiResponse } from '../../http/response/response';

const router = Router();

router.post('/event-attendee-contribution', (req, res) => {
  // Handle event attendee contribution creation
  const response: IApiResponse<null> = { success: true };
  res.status(201).json(response);
});

router.get('/event-attendee-contribution/:id', (req, res) => {
  // Handle fetching an event attendee contribution by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.get('/event-attendee-contribution', (req, res) => {
  // Handle fetching all event attendee contributions
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.put('/event-attendee-contribution/:id', (req, res) => {
  // Handle updating an event attendee contribution by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

router.delete('/event-attendee-contribution/:id', (req, res) => {
  // Handle deleting an event attendee contribution by ID
  const response: IApiResponse<null> = { success: true };
  res.status(200).json(response);
});

export default router;
