export type ProviderType = "spotify" | "apple" | "youtube" | "amazon";

export type PlaylistDraft = {
  primaryProvider: ProviderType | null;
  // Spotify user IDs of accounts whose top tracks should contribute.
  // The primary account is included implicitly only if its ID is in this list,
  // so the user can choose to exclude their own tracks if they want
  contributingAccountIds: string[];
  name: string;
};

export type SkippedAccount = {
  accountId: string;
  displayName: string;
  reason: string;
};

export type CreatedPlaylist = {
  id: string;
  name: string;
  externalUrl: string;
  provider: ProviderType;
  trackCount: number;
  skippedAccounts: SkippedAccount[];
};
