import { create } from "zustand";
import type { UserDto } from "@/api/generated/user";

type AuthTokens = {
  accessToken?: string;
};

type AuthState = AuthTokens & {
  user?: UserDto;
  setAccessToken: (accessToken?: string) => void;
  setSession: (session: AuthTokens & { user?: UserDto }) => void;
  setUser: (user?: UserDto) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: undefined,
  user: undefined,
  setAccessToken: (accessToken) => set({ accessToken }),
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      user: session.user,
    }),
  setUser: (user) => set({ user }),
  clearSession: () =>
    set({
      accessToken: undefined,
      user: undefined,
    }),
}));
