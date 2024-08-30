import { generateFromEmail, generateUsername } from "unique-username-generator";

export function generateUsernameFromEmail(email: string) {
  return generateFromEmail(email);
}

export function generateRandomUsername() {
  return generateUsername();
}
