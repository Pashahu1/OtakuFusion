import { sendVerificationEmail } from '@/lib/mailer';

const VERIFICATION_TTL_MS = 10 * 60 * 1000;

export interface VerificationUserDoc {
  email: string;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
  save: () => Promise<unknown>;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function assignVerificationCode(
  user: VerificationUserDoc,
): Promise<string> {
  const code = generateVerificationCode();
  user.verificationCode = code;
  user.verificationCodeExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
  await user.save();
  return code;
}

export async function deliverVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  await sendVerificationEmail(email, code);
}
