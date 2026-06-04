import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserDto } from "@/api/generated/user";

type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

type AuthState = AuthTokens & {
  user?: UserDto;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user?: UserDto) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      user: undefined,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      setUser: (user) => set({ user }),
      clearSession: () =>
        set({
          accessToken: undefined,
          refreshToken: undefined,
          user: undefined,
        }),
    }),
    {
      name: "lumina-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, refreshToken, user }) => ({
        accessToken,
        refreshToken,
        user,
      }),
    },
  ),
);
