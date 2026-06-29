export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ThunkResult = { ok: true } | { ok: false; errorMessage: string };

// One linked Spotify account (primary or secondary)
export type LinkedSpotifyAccount = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  displayName: string;
  scopes: string;
};

export type SpotifyProviderState = {
  primaryId: string | null;
  accounts: Record<string, LinkedSpotifyAccount>;
};

// Other providers — stubbed for V2.
export type StubProviderState = {
  primaryId: string | null;
  accounts: Record<string, unknown>;
};

export type UserAccounts = {
  spotify: SpotifyProviderState;
  apple: StubProviderState;
  youtube: StubProviderState;
  amazon: StubProviderState;
};

export const EMPTY_USER_ACCOUNTS: UserAccounts = {
  spotify: { primaryId: null, accounts: {} },
  apple: { primaryId: null, accounts: {} },
  youtube: { primaryId: null, accounts: {} },
  amazon: { primaryId: null, accounts: {} },
};

// Defensive read for Firestore docs that might be partial or legacy.
export const normalizeUserAccounts = (raw: unknown): UserAccounts => {
  const r = (raw ?? {}) as Record<string, any>;
  return {
    spotify: {
      primaryId: r.spotify?.primaryId ?? null,
      accounts: r.spotify?.accounts ?? {},
    },
    apple: {
      primaryId: r.apple?.primaryId ?? null,
      accounts: r.apple?.accounts ?? {},
    },
    youtube: {
      primaryId: r.youtube?.primaryId ?? null,
      accounts: r.youtube?.accounts ?? {},
    },
    amazon: {
      primaryId: r.amazon?.primaryId ?? null,
      accounts: r.amazon?.accounts ?? {},
    },
  };
};

export type UserState = {
  uid: string;
  email: string;
  displayName: string;
  status: "checking" | "authenticated" | "unauthenticated";
  userAccounts: UserAccounts;
  isLoading: boolean;
  isLoggedIn: boolean;
};
