import { ISmsSender } from './sms-sender';
import twilio from 'twilio';

export class TwilioSmsSender implements ISmsSender {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.fromNumber) {
      throw new Error(
        'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.'
      );
    }

    this.client = twilio(accountSid, authToken);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation: starts with +, followed by digits, spaces, dashes, parentheses
    const phoneRegex = /^\+?[1-9]\d{1,14}(\s|\-|\(|\))*\d*$/;
    return phoneRegex.test(phoneNumber);
  }

  async sendSms(to: string, message: string): Promise<void> {
    if (!this.isValidPhoneNumber(to)) {
      throw new Error('Invalid phone number format');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });
    } catch (error) {
      throw new Error(`Failed to send SMS: ${(error as Error).message}`);
    }
  }
}
