export interface ISchemaTable {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends ISchemaTable {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  phoneNumber: string;
  verified: boolean;
  locked: boolean;
  lastLogin: Date | null;
  allergies?: UserAllergy[];
  otps?: UserOtp[];
  attendances?: EventAttendee[];
  segmentAttendances?: EventSegmentAttendee[];
  hostedEvents?: Event[];
}

export interface UserAllergy extends ISchemaTable {
  userId: string;
  allergy: string;
  user: User;
}

export interface UserOtp extends ISchemaTable {
  userId: string;
  user: User;
  otp: string;
  expiry: string;
  consumed: boolean;
}

export interface Event extends ISchemaTable {
  name: string;
  description: string;
  date: Date;
  icon: string;
  hostId: string;
  host: User;
  location: string;
  segments: EventSegment[];
  attendees?: EventAttendee[];
}

export interface EventSegment extends ISchemaTable {
  name: string;
  eventId: string;
  event?: Event;
  attendees: EventSegmentAttendee[];
}

export type RsvpStatus = 'Pending' | 'Accepted' | 'Declined';

export interface EventInvitation extends ISchemaTable {
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  eventId: string;
  event: Event;
  message: string;
  viewed: boolean;
  rsvpStatus: RsvpStatus;
}

export interface EventAttendee extends ISchemaTable {
  userId: string;
  eventId: string;
  user: User;
  event: Event;
}

export interface EventSegmentAttendee extends ISchemaTable {
  userId: string;
  user: User;
  segmentId: string;
  segment: EventSegment;
  contributions: EventSegmentAttendeeContribution[];
}

export interface EventSegmentAttendeeContribution extends ISchemaTable {
  item: string;
  description: string;
  quantity: number;
  eventSegmentAttendeeId: string;
  eventSegmentAttendee: EventSegmentAttendee;
}

export interface ChatMessage {
  userId: string;
  message: string;
  timestamp: Date;
}
