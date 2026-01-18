export type UserState = {
  uid: string;
  email: string;
  displayName: string;
  status: "checking" | "authenticated" | "unauthenticated";
  userAccounts: UserAccounts;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export type SpotifyTokens = {
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpiresAt?: number;
  spotifyUserID?: string;
  codeVerifier?: string;
  state?: string;
};

export type AppleTokens = {
  appleAccessToken?: string;
};

export type AmazonTokens = {
  amazonAccessToken?: string;
};

export type YoutubeTokens = {
  youtubeAccessToken?: string;
};

export type UserAccounts = {
  spotifyTokens?: SpotifyTokens;
  appleTokens?: AppleTokens;
  amazonTokens?: AmazonTokens;
  youtubeTokens?: YoutubeTokens;
};
