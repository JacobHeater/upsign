export interface ISmsSender {
  sendSms(to: string, message: string): Promise<void>;
}
