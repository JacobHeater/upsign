import { EventAttendee } from './event-attendee';

export interface EventAttendeeContribution {
  id: string;
  item: string;
  description: string;
  quantity: number;
  attendeeId: string;
  attendee: EventAttendee;
}
