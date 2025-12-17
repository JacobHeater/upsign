import { EventAttendeeContribution } from './event-attendee-contribution';
import { EventSegment } from './event-segment';
import { User } from './user';

export interface EventAttendee {
  id: string;
  userId: string;
  segmentId: string;
  user: User;
  segment: EventSegment;
  contributions: EventAttendeeContribution[];
}
