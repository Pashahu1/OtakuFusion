export type User = {
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  isVerified?: boolean;
};
