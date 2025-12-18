require('dotenv').config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user/router';
import eventRouter from './routes/event/router';
import eventSegmentRouter from './routes/event-segment/router';
import eventAttendeeRouter from './routes/event-attendee/router';
import eventAttendeeContributionRouter from './routes/event-attendee-contribution/router';
import accountRouter from './routes/account/router';
import eventInvitationRouter from './routes/event-invitation/router';
import { authMiddleware } from './middleware/auth';
import logger from './utils/logger';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authMiddleware);
app.use('/api/account', accountRouter);
app.use('/api/user', userRouter);
app.use('/api/event', eventRouter);
app.use('/api/event-segment', eventSegmentRouter);
app.use('/api/event-attendee', eventAttendeeRouter);
app.use('/api/event-attendee-contribution', eventAttendeeContributionRouter);
app.use('/api/event-invitation', eventInvitationRouter);

app.get('/', (_, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3002;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

export default app;
