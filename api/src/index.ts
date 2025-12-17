import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user/router';
import eventRouter from './routes/event/router';
import eventSegmentRouter from './routes/event-segment/router';
import eventAttendeeRouter from './routes/event-attendee/router';
import eventAttendeeContributionRouter from './routes/event-attendee-contribution/router';
import accountRouter from './routes/account/router';
import { authMiddleware } from './middleware/auth';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', authMiddleware);

app.use('/api', userRouter);
app.use('/api', eventRouter);
app.use('/api', eventSegmentRouter);
app.use('/api', eventAttendeeRouter);
app.use('/api', eventAttendeeContributionRouter);
app.use('/api', accountRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
