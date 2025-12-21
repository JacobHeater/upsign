import 'dotenv/config';

import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user/router';
import eventRouter from './routes/event/router';
import eventSegmentRouter from './routes/event-segment/router';
import eventAttendeeRouter from './routes/event-attendee/router';
import eventSegmentAttendeeRouter from './routes/event-segment-attendee/router';
import eventSegmentAttendeeContributionRouter from './routes/event-segment-attendee-contribution/router';
import accountRouter from './routes/account/router';
import eventInvitationRouter from './routes/event-invitation/router';
import eventChatMessageRouter from './routes/event-chat-message/router';
import eventChatMessageReactionRouter from './routes/event-chat-message-reaction/router';
import { authMiddleware } from './middleware/auth';
import logger from './utils/logger';
import socketManager from './socket';

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
app.use('/api/event-segment-attendee', eventSegmentAttendeeRouter);
app.use('/api/event-segment-attendee-contribution', eventSegmentAttendeeContributionRouter);
app.use('/api/event-invitation', eventInvitationRouter);
app.use('/api/event-chat-message', eventChatMessageRouter);
app.use('/api/event-chat-message-reaction', eventChatMessageReactionRouter);

app.get('/', (_, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
socketManager.init(server);

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
