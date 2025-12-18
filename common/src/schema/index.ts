export interface User {
  id: string;
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
  hostedEvents?: Event[];
}

export interface UserAllergy {
  id: string;
  userId: string;
  allergy: string;
  user: User;
}

export interface UserOtp {
  id: string;
  userId: string;
  user: User;
  otp: string;
  expiry: string;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  hostId: string;
  host: User;
  location: string;
  segments: EventSegment[];
}

export interface EventSegment {
  id: string;
  name: string;
  eventId: string;
  event?: Event;
  attendees: EventAttendee[];
}

export const RsvpStatus = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Declined: 'Declined',
} as const;

export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];

export interface EventInvitation {
  id: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  message: string;
  viewed: boolean;
  rsvpStatus: RsvpStatus;
}

export interface EventAttendee {
  id: string;
  userId: string;
  segmentId: string;
  user: User;
  segment: EventSegment;
  contributions: EventAttendeeContribution[];
}

export interface EventAttendeeContribution {
  id: string;
  item: string;
  description: string;
  quantity: number;
  attendeeId: string;
  attendee: EventAttendee;
}
