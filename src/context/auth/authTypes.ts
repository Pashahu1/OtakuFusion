export interface LoginResult {
  ok: boolean;
  message?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  isVerified: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuth: boolean;
  isLoading: boolean;
  profileSavePending: boolean;
  setProfileSavePending: (pending: boolean) => void;
  profileNavbarAvatarHold: boolean;
  setProfileNavbarAvatarHold: (hold: boolean) => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  verifyEmailOpen: boolean;
  openVerifyEmailModal: (email?: string) => void;
  closeVerifyEmailModal: () => void;
}
