export function normalizePhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber) return null;

  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // If it starts with 1 and has 11 digits, remove the leading 1 (US country code)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.slice(1);
  }

  // Must be exactly 10 digits for US numbers
  if (digitsOnly.length === 10) {
    return digitsOnly;
  }

  return null;
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  return normalizePhoneNumber(phoneNumber) !== null;
}
