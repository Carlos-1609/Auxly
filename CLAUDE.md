# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # expo start (Metro bundler, choose iOS/Android/web from prompt)
npm run ios        # expo run:ios — builds & runs the native iOS app (required for Firebase Auth native modules)
npm run android    # expo run:android
npm run web        # expo start --web
npm run lint       # expo lint (eslint-config-expo)
npm run reset-project  # destructive: moves current app/ into app-example/ and scaffolds a blank app/
```

There is no test runner configured. Do not invent one.

This is a managed Expo project with native code generated under `ios/` (Android dir not committed). After changing any native config (`app.json`, plugins, `@react-native-firebase/*`), `npm run ios` / `expo prebuild` must be re-run — Expo Go cannot host the Firebase native modules.

`.env` holds `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. Only `EXPO_PUBLIC_`-prefixed vars are exposed to the client.

## Architecture

Expo Router (v6) + Redux Toolkit + Firebase (Auth + Firestore) + Spotify OAuth (PKCE). NativeWind for styling.

### Routing (`app/`, file-based)

- `app/_layout.tsx` — root: wraps `<Slot />` in Redux `<Provider>` and mounts `<Toast>`.
- `app/index.tsx` — entry gate. Uses `useCheckAuth()`; redirects to `/playlist` if logged in, `/auth` otherwise. Shows `LoadingOverlay` while `status === "checking"`.
- `app/auth/` — sign-in / sign-up / password reset / `VerifyCode`.
- `app/auth/callback.tsx` — Spotify OAuth redirect target (`auxly://auth/callback`). Reads `code`/`state` from query params, validates against AsyncStorage-stashed PKCE verifier + state, exchanges for tokens, dispatches `storeSpotifyTokens`. Bails out quietly if `spotify_auth_in_progress` flag isn't set (dev deep-link replays).
- `app/(tabs)/` — authenticated area: `playlist/` (index, `CreatePlaylist`, `AddAccounts`, `AccountChooser`), `profile/` (index, `ConnectedAccounts`), and `PlaylistHistory.tsx`. `CustomTabBar` in `components/`.

Path alias: `@/*` → repo root (e.g., `@/store/...`, `@/components/...`, `@/firebase/...`).

`typedRoutes: true` and `reactCompiler: true` are enabled in `app.json` — typed `href` strings and the React Compiler are active.

### State (`store/`)

Single Redux store with two slices:
- `auth/authSlice.ts` + `authThunk.ts` — Firebase user + `userAccounts` (per-provider tokens) loaded from the Firestore `userAccounts/{uid}` doc. `status` is `"checking" | "authenticated" | "unauthenticated"`.
- `playlists/playlistSlice.ts` + `playlistThunk.ts` — Spotify token refresh, `storeSpotifyTokens` (writes to Firestore + fetches Spotify `/me` for `spotifyUserID`).

Use typed hooks from `store/hooks.ts`: `useAppDispatch`, `useAppSelector`. Do not import `useDispatch`/`useSelector` directly.

`useCheckAuth()` in `hooks/useCheckAuth.ts` registers an `onAuthStateChanged` listener that hydrates the auth slice (and fetches `userAccounts` from Firestore) on every mount. Currently registered with `[]` deps — no unsubscribe on unmount.

### Firebase (`firebase/`)

- `firebaseConfig.ts` — initializes the Web Firebase SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`) with AsyncStorage persistence via the untyped `getReactNativePersistence`. Exports `FirebaseAuth` and `FirebaseDB`. There is also a `@react-native-firebase/*` dependency installed; do not mix the two SDKs in new code without aligning with what's already used in the file you're editing.
- `providers.ts` — thin wrappers around Firebase email/password auth (`userSignUpFirebase`, `userSignInFirebase`, `userPasswordResetFirebase`, `userLogoutFirebase`).

Firestore schema: collection `userAccounts`, doc id = Firebase `uid`, shape `UserAccounts` from `types/auth.ts` (`spotifyTokens`, `appleTokens`, `amazonTokens`, `youtubeTokens`). Spotify token writes use dotted-path `updateDoc` (e.g. `"spotifyTokens.spotifyAccessToken"`) to merge into nested fields.

### Spotify OAuth (PKCE) flow

1. `connectSpotifyAccount(primary)` (in `store/auth/authThunk.ts`) generates a verifier (`expo-crypto` random bytes → SHA256 → base64url challenge), stashes verifier/state/`spotify_primary`/`spotify_auth_in_progress` in AsyncStorage, then `Linking.openURL` to Spotify's `/authorize`. Redirect URI is `Linking.createURL("auth/callback")` → resolves to `auxly://auth/callback` (scheme set in `app.json`).
2. Spotify redirects back to `app/auth/callback.tsx`, which validates state, exchanges the code, dispatches `storeSpotifyTokens` for primary accounts.
3. `refreshSpotifyToken` in `playlistThunk.ts` handles refresh using the stored refresh token.

Scopes differ by `primary === "1"` (full playlist-modify scopes) vs secondary (`user-top-read` only).

### Styling

NativeWind v4 + Tailwind. `tailwind.config.js` defines the design tokens — use semantic classnames like `bg-bg-base`, `text-text-primary`, `text-text-secondary`, `bg-coral`, `text-error` rather than raw hex. `global.css` is imported once in `app/_layout.tsx`.

### Forms

`react-hook-form` + `zod` via `@hookform/resolvers`. The shared input component is `components/ui/FormInput.tsx`.

## Conventions worth knowing

- `startUserSignin` in `store/auth/authThunk.ts` currently **hardcodes** the test credentials `carlosord1609@gmail.com` / `Honduras_16` and ignores its arguments — this is a dev-time shortcut, not intended behavior. Restore the real `email, password` call before shipping anything that touches sign-in.
- Thunk return shape is `{ ok: boolean, errorMessage?: string }` (sometimes just `true`/`false`). Match that pattern in new thunks.
- The slice setter `setIsLoading` is shared across auth and playlist thunks for a single global loading flag — `LoadingOverlay` in `components/ui/` consumes it.
- `expo-router` `typedRoutes` is on, so `href` strings must match real routes (e.g., `/playlist`, `/auth`).
