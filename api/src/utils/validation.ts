export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation: starts with +, followed by digits, spaces, dashes, parentheses
  const phoneRegex = /^\+?[1-9][\d\s\-\(\)]*$/;
  return phoneRegex.test(phoneNumber);
}
