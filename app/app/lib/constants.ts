export const RsvpStatus = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Declined: 'Declined',
} as const;

export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];
