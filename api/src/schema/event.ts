import { EventSegment } from './event-segment';

export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  segments: EventSegment[];
}
