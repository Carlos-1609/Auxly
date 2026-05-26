import { CreatedPlaylist, PlaylistDraft, ProviderType } from "@/types/playlist";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlaylistState = {
  isLoading: boolean;
  draft: PlaylistDraft;
  lastCreated: CreatedPlaylist | null;
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
} = playlistSlice.actions;
export default playlistSlice.reducer;
