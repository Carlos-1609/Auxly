# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # expo start (Metro bundler, choose iOS/Android/web from prompt)
npm run ios        # expo run:ios — native dev client build (required for the auxly:// OAuth scheme)
npm run android    # expo run:android
npm run web        # expo start --web
npm run lint       # expo lint (eslint-config-expo)
npm run reset-project  # destructive: moves current app/ into app-example/ and scaffolds a blank app/
```

No test runner is configured. Do not invent one.

Managed Expo project with `ios/` checked in (Android dir not committed). After native config changes (`app.json`, plugins), re-run `npm run ios`. Spotify OAuth's `auxly://auth/callback` redirect only works in the dev client; in Expo Go the redirect URI changes to `exp://...` and Spotify rejects it.

`.env` holds `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. Only `EXPO_PUBLIC_`-prefixed vars are exposed to the client.

## Architecture

Expo Router (v6) + Redux Toolkit + Firebase (Auth + Firestore) + Spotify OAuth (PKCE). NativeWind for styling. Product is a multi-account playlist mixer: pull top tracks from N linked Spotify accounts, dedupe, create a single playlist on the primary account.

### Routing (`app/`, file-based)

- `app/_layout.tsx` — root: Redux `<Provider>`, mounts `<AuthGate>` which calls `useAuthListener()` (must be the *only* call site — see Auth below), then `<Slot />` and `<Toast>`.
- `app/index.tsx` — entry gate. Reads auth state via `useCheckAuth()` (pure selector now), redirects accordingly.
- `app/auth/` — sign-in / sign-up / password reset / OAuth callback.
- `app/auth/callback.tsx` — Spotify OAuth redirect target (`auxly://auth/callback`). Validates state, exchanges the code, dispatches `linkSpotifyAccount({ ..., isPrimary })`. Bails out quietly if `spotify_auth_in_progress` isn't set (dev deep-link replays).
- `app/(tabs)/playlist/` — `index` (FAB → AccountChooser), `AccountChooser` (pick primary provider), `AddAccounts` (pick contributing accounts, link secondaries, health-check), `CreatePlaylist` (name + dispatch), `PlaylistCreated` (success screen with skipped-accounts + Re-link).
- `app/(tabs)/profile/ConnectedAccounts.tsx` — link/unlink the **primary** Spotify account.

Path alias: `@/*` → repo root. `typedRoutes: true` and `reactCompiler: true` are on in `app.json`.

### State (`store/`)

Two slices, both with their own `isLoading` flag (don't share):
- `auth/authSlice.ts` — Firebase user + `userAccounts`. `auth.isLoading` is *only* for sign-in/sign-up.
- `playlists/playlistSlice.ts` — `draft` (in-progress playlist), `lastCreated`, `accountHealth` (transient per-account probe results), `isLoading` for **all Spotify operations** (connect, disconnect, refresh, create, validate).

Use typed hooks from `store/hooks.ts`: `useAppDispatch`, `useAppSelector`. Prefer scalar selectors — returning composite objects (`useAppSelector(s => ({a, b}))`) re-renders on every dispatch.

### Auth listener pattern (important)

`hooks/useCheckAuth.ts` exports two functions:
- `useAuthListener()` — registers Firebase `onAuthStateChanged`, returns cleanup. **Must be called from exactly one place** (`app/_layout.tsx`'s `<AuthGate>`). Mounting it in multiple components stacks listeners that never unsubscribe.
- `useCheckAuth()` — pure Redux selector for `{ status, isLoggedIn }`. Safe to call anywhere.

### Thunk contract

Every thunk returns `Promise<ThunkResult>` where `ThunkResult = { ok: true } | { ok: false; errorMessage: string }`. UI callers check `result.ok` (the `errorMessage` is type-narrowed after). Loading state is managed in `try/finally` so it cleans up on every path including errors.

### UserAccounts data model (Firestore: `userAccounts/{uid}`)

Multi-account by design. Keyed by Spotify's permanent user ID, not arrays:

```ts
{
  spotify: {
    primaryId: string | null,   // pointer to which account is the "host" for playlist writes
    accounts: {
      [spotifyUserID]: { accessToken, refreshToken, expiresAt, displayName, scopes }
    }
  },
  apple:   { primaryId: null, accounts: {} },   // stub for Phase 2
  youtube: { primaryId: null, accounts: {} },   // stub — no public API exists, may never ship
  amazon:  { primaryId: null, accounts: {} }    // stub — same
}
```

**Always read via `normalizeUserAccounts(raw)` from `types/auth.ts`** — Firestore docs may be partial; the normalizer guarantees the full shape with defaults. Don't `?.` chain at call sites.

Per-account writes use dotted paths to avoid array rewrites: `updateDoc(doc, { "spotify.accounts.${id}.accessToken": newToken })`. `linkSpotifyAccount` uses `setDoc(..., { merge: true })` so it handles both first-link and re-link.

### Spotify operations (`store/playlists/playlistThunk.ts`)

- `connectSpotifyAccount(primary, { forceShowDialog? })` in `authThunk.ts` — kicks off PKCE OAuth. `forceShowDialog: true` appends `show_dialog=true` to the Spotify URL so re-links can pick a specific account instead of silently using whoever's signed into the browser.
- `linkSpotifyAccount({ accessToken, refreshToken, expiresAt, scopes, isPrimary })` — called from the OAuth callback after code exchange. Fetches `/me` for the canonical Spotify ID + display name, writes to `spotify.accounts[id]`, optionally sets `primaryId`. Rejects re-linking the primary as a secondary.
- `disconnectSpotifyAccount(spotifyUserId)` — takes a specific account ID; clears `primaryId` if disconnecting the primary.
- `ensureFreshSpotifyToken(dispatch, getState, accountId)` — private. Returns a non-expired access token, refreshing via `performSpotifyRefresh` (also private, no loading-state side effects so it's safe to compose). 60-second buffer before expiry.
- `refreshSpotifyToken()` — public wrapper around `performSpotifyRefresh` for the primary only, manages loading state.
- `validateAccountHealth(accountId)` / `validateAllSpotifyAccounts()` — **forced** refresh per account (not just `/me` ping). Spotify access tokens survive grant revocation until natural expiry, so only the refresh endpoint actually checks the grant. Sets per-account `health` in Redux: `"unknown" | "checking" | "healthy" | "needs_reauth"`. Only `invalid_grant` marks an account permanently dead; other failures are treated as transient.
- `createPlaylistFromDraft()` — fan-out over `draft.contributingAccountIds` via `Promise.all`, dedupes URIs via `Set`, creates the playlist on the primary, writes `lastCreated` with `skippedAccounts` for any failures, resets the draft. Skip-and-warn: one failed account doesn't block the others.

### Pure API helpers (`firebase/spotifyApi.ts`)

`getTopTracks`, `createSpotifyPlaylist`, `addTracksToSpotifyPlaylist`, `refreshSpotifyAccessToken`, `getCurrentSpotifyUser`. Throw on non-2xx (single `assertOk` helper). Caller-owned auth — they take a token, never the store.

### AddAccounts staleness checks

Health is re-probed on: screen focus (`useFocusEffect`), app foreground (`AppState` listener), pull-to-refresh (`RefreshControl`). Dead accounts can't be selected as contributors and auto-drop from the existing selection. The Re-link button calls `connectSpotifyAccount(isPrimary, { forceShowDialog: true })`.

### Firebase (`firebase/`)

- `firebaseConfig.ts` — Web Firebase SDK with AsyncStorage persistence via the untyped `getReactNativePersistence`. Exports `FirebaseAuth`, `FirebaseDB`. `@react-native-firebase/*` is *also* installed but unused — pick one before adopting it broadly.
- `providers.ts` — Firebase email/password wrappers. They **throw** on error; `mapAuthError(error)` in `firebase/authErrors.ts` translates Firebase error codes to user-facing messages.

### Styling / Forms

NativeWind v4 + Tailwind, semantic tokens (`bg-bg-base`, `text-text-primary`, `bg-coral`, `text-error`) — see `tailwind.config.js`. `global.css` imported once in `app/_layout.tsx`.

`react-hook-form` + `zod` via `@hookform/resolvers`. Shared input: `components/ui/FormInput.tsx`.

## Conventions worth knowing

- **Multi-account is the product, not a future feature.** Cross-provider merging (Spotify ↔ Apple Music via ISRC matching) is the long-term goal. YouTube Music and Amazon Music are stubs because neither has a public API — keep them in the type but don't promise them in UI.
- Thunk return shape: always `Promise<ThunkResult>`. Match the `try { ... return {ok:true} } catch { return {ok:false, errorMessage} } finally { setLoading(false) }` pattern.
- Composable thunks should have a "pure" inner helper that doesn't dispatch loading state (`performSpotifyRefresh`) so outer thunks can call them without nested loading toggles racing.
- AsyncStorage keys for OAuth flow are listed in `app/auth/callback.tsx` (`SPOTIFY_FLAG_KEYS`). Use the `clearSpotifyAuthFlags()` helper instead of inlining `multiRemove`.
- `expo-router` `typedRoutes` is on — `href` strings must match real routes.
- `expo-auth-session` is installed but unused; PKCE is hand-rolled in `connectSpotifyAccount`. Either adopt the library or drop the dep.
