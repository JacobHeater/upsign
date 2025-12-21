export interface ISchemaTable {
  // Primary key
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends ISchemaTable {
  firstName: string;
  lastName: string;
  // Unique constraint user_email
  email: string;
  dateOfBirth: Date;
  // Unique constraint user_phone_number
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
  // FK User.id
  // Unique constraint user_allergy
  userId: string;
  // Unique constraint user_allergy
  allergy: string;
  user: User;
}

export interface UserOtp extends ISchemaTable {
  // FK User.id
  userId: string;
  user: User;
  otp: string;
  expiry: Date;
  consumed: boolean;
}

export interface Event extends ISchemaTable {
  name: string;
  description: string;
  date: Date;
  icon: string;
  // FK User.id
  hostId: string;
  host: User;
  location: string;
  segments: EventSegment[];
  attendees?: EventAttendee[];
  // Default: false
  cancelled?: boolean;
}

export interface EventChatMessage extends ISchemaTable {
  // FK User.id
  userId: string;
  user: User;
  // FK Event.id
  eventId: string;
  event: Event;
  message: string;
  reactions?: EventChatMessageReaction[];
}

export interface EventChatMessageReaction extends ISchemaTable {
  // FK EventChatMessage.id
  // Unuque constraint message_user_reaction
  messageId: string;
  message: EventChatMessage;
  // FK User.id
  // Unuque constraint message_user_reaction
  userId: string;
  user: User;
  // Unuque constraint message_user_reaction
  reaction: string;
}

export interface EventSegment extends ISchemaTable {
  // Unique constraint event_segment_name
  name: string;
  // FK Event.id
  eventId: string;
  event?: Event;
  attendees: EventSegmentAttendee[];
}

export type RsvpStatus = 'Pending' | 'Accepted' | 'Declined';

export interface EventInvitation extends ISchemaTable {
  // FK User.id
  senderId: string;
  sender: User;
  // FK User.id
  recipientId: string;
  recipient: User;
  // FK Event.id
  eventId: string;
  event: Event;
  message: string;
  viewed: boolean;
  rsvpStatus: RsvpStatus;
}

export interface EventAttendee extends ISchemaTable {
  // FK User.id
  userId: string;
  // FK Event.id
  eventId: string;
  user: User;
  event: Event;
}

export interface EventSegmentAttendee extends ISchemaTable {
  // FK User.id
  userId: string;
  user: User;
  // FK EventSegment.id
  segmentId: string;
  segment: EventSegment;
  contributions: EventSegmentAttendeeContribution[];
}

export interface EventSegmentAttendeeContribution extends ISchemaTable {
  // Unique constraint segment_attendee_item
  item: string;
  description: string;
  quantity: number;
  // FK EventSegmentAttendee.id
  eventSegmentAttendeeId: string;
  eventSegmentAttendee: EventSegmentAttendee;
}
