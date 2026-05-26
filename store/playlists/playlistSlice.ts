import { CreatedPlaylist, PlaylistDraft, ProviderType } from "@/types/playlist";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AccountHealth =
  | "unknown"
  | "checking"
  | "healthy"
  | "needs_reauth";

type PlaylistState = {
  isLoading: boolean;
  draft: PlaylistDraft;
  lastCreated: CreatedPlaylist | null;
  // Transient per-account health from validation probes. Keyed by Spotify userID.
  // Not persisted — re-checked each time AddAccounts mounts.
  accountHealth: Record<string, AccountHealth>;
};

const emptyDraft: PlaylistDraft = {
  primaryProvider: null,
  contributingAccountIds: [],
  name: "",
};

const initialState: PlaylistState = {
  isLoading: false,
  draft: emptyDraft,
  lastCreated: null,
  accountHealth: {},
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylistLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
    setPrimaryProvider: (
      state,
      { payload }: PayloadAction<ProviderType | null>
    ) => {
      state.draft.primaryProvider = payload;
    },
    setDraftName: (state, { payload }: PayloadAction<string>) => {
      state.draft.name = payload;
    },
    toggleContributingAccount: (state, { payload }: PayloadAction<string>) => {
      const idx = state.draft.contributingAccountIds.indexOf(payload);
      if (idx === -1) state.draft.contributingAccountIds.push(payload);
      else state.draft.contributingAccountIds.splice(idx, 1);
    },
    setContributingAccounts: (
      state,
      { payload }: PayloadAction<string[]>
    ) => {
      state.draft.contributingAccountIds = payload;
    },
    resetDraft: (state) => {
      state.draft = emptyDraft;
    },
    setLastCreated: (
      state,
      { payload }: PayloadAction<CreatedPlaylist | null>
    ) => {
      state.lastCreated = payload;
    },
    setAccountHealth: (
      state,
      {
        payload,
      }: PayloadAction<{ accountId: string; status: AccountHealth }>
    ) => {
      state.accountHealth[payload.accountId] = payload.status;
    },
    setManyAccountHealth: (
      state,
      { payload }: PayloadAction<Record<string, AccountHealth>>
    ) => {
      state.accountHealth = { ...state.accountHealth, ...payload };
    },
  },
});

export const {
  setPlaylistLoading,
  setPrimaryProvider,
  setDraftName,
  toggleContributingAccount,
  setContributingAccounts,
  resetDraft,
  setLastCreated,
  setAccountHealth,
  setManyAccountHealth,
} = playlistSlice.actions;
export default playlistSlice.reducer;
