import { FirebaseDB } from "@/firebase/firebaseConfig";
import {
  addTracksToSpotifyPlaylist,
  createSpotifyPlaylist,
  getCurrentSpotifyUser,
  getTopTracks,
  refreshSpotifyAccessToken,
} from "@/firebase/spotifyApi";
import {
  LinkedSpotifyAccount,
  normalizeUserAccounts,
  ThunkResult,
} from "@/types/auth";
import { SkippedAccount } from "@/types/playlist";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { setUserAccounts } from "../auth/authSlice";
import { AppDispatch, RootState } from "../store";
import {
  resetDraft,
  setLastCreated,
  setPlaylistLoading,
} from "./playlistSlice";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const TOKEN_REFRESH_BUFFER_MS = 60_000;

const isTokenExpired = (expiresAt?: number) =>
  !expiresAt || Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS;

// Re-read the user's account doc and sync it into Redux.
const syncUserAccounts = async (dispatch: AppDispatch, uid: string) => {
  const snap = await getDoc(doc(FirebaseDB, "userAccounts", uid));
  dispatch(setUserAccounts(normalizeUserAccounts(snap.data())));
};

// Pure refresh for a single account. Writes new tokens to Firestore,
// syncs Redux, returns the new access token. Does not touch loading state.
const performSpotifyRefresh = async (
  dispatch: AppDispatch,
  uid: string,
  spotifyUserId: string,
  refreshToken: string
): Promise<string> => {
  const tokens = await refreshSpotifyAccessToken(
    SPOTIFY_CLIENT_ID,
    refreshToken
  );
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  const base = `spotify.accounts.${spotifyUserId}`;

  const updateData: Record<string, string | number> = {
    [`${base}.accessToken`]: tokens.access_token,
    [`${base}.expiresAt`]: expiresAt,
  };
  if (tokens.refresh_token) {
    updateData[`${base}.refreshToken`] = tokens.refresh_token;
  }

  await updateDoc(doc(FirebaseDB, "userAccounts", uid), updateData);
  await syncUserAccounts(dispatch, uid);
  return tokens.access_token;
};

// Public thunk wrapper around performSpotifyRefresh for the *primary* account.
export const refreshSpotifyToken = () => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<ThunkResult> => {
    dispatch(setPlaylistLoading(true));
    try {
      const { uid, userAccounts } = getState().auth;
      const primaryId = userAccounts.spotify.primaryId;
      if (!primaryId) {
        return { ok: false, errorMessage: "No primary Spotify account linked." };
      }
      const account = userAccounts.spotify.accounts[primaryId];
      if (!account?.refreshToken) {
        return { ok: false, errorMessage: "Refresh token not found." };
      }
      await performSpotifyRefresh(dispatch, uid, primaryId, account.refreshToken);
      return { ok: true };
    } catch (error: any) {
      console.error("[refreshSpotifyToken]", error);
      return { ok: false, errorMessage: error.message ?? "Refresh failed." };
    } finally {
      dispatch(setPlaylistLoading(false));
    }
  };
};

// Called from the OAuth callback after a successful code exchange.
// Fetches /me to get the canonical Spotify user ID, then stores the account
// under spotify.accounts[id] and optionally sets it as primary.
export const linkSpotifyAccount = (params: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string;
  isPrimary: boolean;
}) => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<ThunkResult> => {
    dispatch(setPlaylistLoading(true));
    try {
      const { uid, userAccounts } = getState().auth;
      const me = await getCurrentSpotifyUser(params.accessToken);

      // Reject re-linking the primary as a secondary (would be redundant).
      if (!params.isPrimary && userAccounts.spotify.primaryId === me.id) {
        return {
          ok: false,
          errorMessage:
            "This account is already linked as your primary Spotify account.",
        };
      }

      const account: LinkedSpotifyAccount = {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        expiresAt: params.expiresAt,
        displayName: me.displayName,
        scopes: params.scopes,
      };

      await setDoc(
        doc(FirebaseDB, "userAccounts", uid),
        {
          spotify: {
            ...(params.isPrimary ? { primaryId: me.id } : {}),
            accounts: { [me.id]: account },
          },
        },
        { merge: true }
      );

      await syncUserAccounts(dispatch, uid);
      return { ok: true };
    } catch (error: any) {
      console.error("[linkSpotifyAccount]", error);
      return {
        ok: false,
        errorMessage: error.message ?? "Could not link Spotify account.",
      };
    } finally {
      dispatch(setPlaylistLoading(false));
    }
  };
};

// Disconnect a specific Spotify account by ID. If it's the primary,
// also clears primaryId.
export const disconnectSpotifyAccount = (spotifyUserId: string) => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<ThunkResult> => {
    dispatch(setPlaylistLoading(true));
    try {
      const { uid, userAccounts } = getState().auth;
      if (!uid) throw new Error("Missing user uid");

      const updateData: Record<string, any> = {
        [`spotify.accounts.${spotifyUserId}`]:
          // Firestore sentinel to delete the field would be cleaner, but
          // setting null + filtering on read keeps the dependency footprint
          // small. We'll just remove the key via dotted path delete-equivalent:
          // writing FieldValue.delete() requires importing it. Use null + normalize.
          null,
      };
      if (userAccounts.spotify.primaryId === spotifyUserId) {
        updateData["spotify.primaryId"] = null;
      }
      await updateDoc(doc(FirebaseDB, "userAccounts", uid), updateData);
      await syncUserAccounts(dispatch, uid);
      return { ok: true };
    } catch (error: any) {
      console.error("[disconnectSpotifyAccount]", error);
      return {
        ok: false,
        errorMessage: error.message ?? "Could not disconnect Spotify.",
      };
    } finally {
      dispatch(setPlaylistLoading(false));
    }
  };
};

// Returns a non-expired access token for a specific linked account,
// refreshing first if needed. Throws on missing/invalid account.
const ensureFreshSpotifyToken = async (
  dispatch: AppDispatch,
  getState: () => RootState,
  spotifyUserId: string
): Promise<string> => {
  const { uid, userAccounts } = getState().auth;
  const account = userAccounts.spotify.accounts[spotifyUserId];
  if (!account?.accessToken || !account.refreshToken) {
    throw new Error(`Spotify account ${spotifyUserId} is not linked.`);
  }
  if (!isTokenExpired(account.expiresAt)) {
    return account.accessToken;
  }
  return performSpotifyRefresh(dispatch, uid, spotifyUserId, account.refreshToken);
};

type FetchResult =
  | { ok: true; uris: string[] }
  | { ok: false; accountId: string; displayName: string; reason: string };

const fetchTopTracksForAccount = async (
  dispatch: AppDispatch,
  getState: () => RootState,
  accountId: string
): Promise<FetchResult> => {
  const account = getState().auth.userAccounts.spotify.accounts[accountId];
  const displayName = account?.displayName ?? accountId;
  try {
    const token = await ensureFreshSpotifyToken(dispatch, getState, accountId);
    const tracks = await getTopTracks(token, {
      timeRange: "short_term",
      limit: 10,
    });
    return { ok: true, uris: tracks.map((t) => t.uri) };
  } catch (error: any) {
    return {
      ok: false,
      accountId,
      displayName,
      reason: error.message ?? "Fetch failed",
    };
  }
};

export const createPlaylistFromDraft = () => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<ThunkResult> => {
    dispatch(setPlaylistLoading(true));
    try {
      const { draft } = getState().playlist;
      const name = draft.name.trim();

      if (!name) {
        return { ok: false, errorMessage: "Please enter a playlist name." };
      }
      if (draft.primaryProvider !== "spotify") {
        return {
          ok: false,
          errorMessage: "Only Spotify is supported right now.",
        };
      }

      const primaryId = getState().auth.userAccounts.spotify.primaryId;
      if (!primaryId) {
        return {
          ok: false,
          errorMessage: "Connect a primary Spotify account first.",
        };
      }

      // Determine contributors: the explicit list, or fall back to the primary
      // alone if the user didn't pick anyone in AddAccounts.
      const contributorIds =
        draft.contributingAccountIds.length > 0
          ? draft.contributingAccountIds
          : [primaryId];

      // Fan out fetches concurrently.
      const results = await Promise.all(
        contributorIds.map((id) =>
          fetchTopTracksForAccount(dispatch, getState, id)
        )
      );

      const allUris: string[] = [];
      const skipped: SkippedAccount[] = [];
      for (const r of results) {
        if (r.ok) allUris.push(...r.uris);
        else
          skipped.push({
            accountId: r.accountId,
            displayName: r.displayName,
            reason: r.reason,
          });
      }

      const uniqueUris = Array.from(new Set(allUris));

      if (uniqueUris.length === 0) {
        return {
          ok: false,
          errorMessage:
            skipped.length > 0
              ? "Couldn't pull tracks from any account."
              : "No tracks found to add.",
        };
      }

      // Write the playlist using the primary account's token.
      const primaryToken = await ensureFreshSpotifyToken(
        dispatch,
        getState,
        primaryId
      );
      const playlist = await createSpotifyPlaylist(primaryToken, primaryId, {
        name,
        description: "Created with Auxly",
      });
      await addTracksToSpotifyPlaylist(primaryToken, playlist.id, uniqueUris);

      dispatch(
        setLastCreated({
          id: playlist.id,
          name: playlist.name,
          externalUrl: playlist.externalUrl,
          provider: "spotify",
          trackCount: uniqueUris.length,
          skippedAccounts: skipped,
        })
      );
      dispatch(resetDraft());
      return { ok: true };
    } catch (error: any) {
      console.error("[createPlaylistFromDraft]", error);
      return {
        ok: false,
        errorMessage: error.message ?? "Could not create playlist.",
      };
    } finally {
      dispatch(setPlaylistLoading(false));
    }
  };
};
