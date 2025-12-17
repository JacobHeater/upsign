export interface User {
  id: string;
  firstName: string;
  lastName: string;
  allergies: string[];
  email: string;
  dateOfBirth: Date;
  phoneNumber: string;
  verified: boolean;
  locked: boolean;
  lastLogin: Date | null;
}
