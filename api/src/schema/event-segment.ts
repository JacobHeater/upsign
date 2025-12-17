import { EventAttendee } from './event-attendee';

export interface EventSegment {
  id: string;
  name: string;
  eventId: string;
  attendees: EventAttendee[];
}
