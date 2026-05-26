import { mapAuthError } from "@/firebase/authErrors";
import { FirebaseDB } from "@/firebase/firebaseConfig";
import { userSignInFirebase, userSignUpFirebase } from "@/firebase/providers";
import {
  EMPTY_USER_ACCOUNTS,
  normalizeUserAccounts,
  SignupData,
  ThunkResult,
  UserAccounts,
} from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { doc, getDoc } from "firebase/firestore";
import { setPlaylistLoading } from "../playlists/playlistSlice";
import { AppDispatch } from "../store";
import { setIsLoading, setUser } from "./authSlice";

export const generateRandomString = async (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  let text = "";
  for (let i = 0; i < randomBytes.length; i++) {
    text += possible[randomBytes[i] % possible.length];
  }
  return text;
};

export const getCodeVerifier = async () => generateRandomString(64);

export const getChallengeFromVerifier = async (verifier: string) => {
  const base64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const startUserSignUp = (data: SignupData) => {
  return async (dispatch: AppDispatch): Promise<ThunkResult> => {
    dispatch(setIsLoading(true));
    try {
      const user = await userSignUpFirebase(data);
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          userAccounts: EMPTY_USER_ACCOUNTS,
        })
      );
      return { ok: true };
    } catch (error) {
      console.error("[startUserSignUp]", error);
      return { ok: false, errorMessage: mapAuthError(error) };
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const startUserSignin = (email: string, password: string) => {
  return async (dispatch: AppDispatch): Promise<ThunkResult> => {
    dispatch(setIsLoading(true));
    try {
      const user = await userSignInFirebase(email, password);
      const userAccounts = await getUserAccountTokens(user.uid);
      dispatch(
        setUser({
          uid: user.uid,
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          userAccounts,
        })
      );
      return { ok: true };
    } catch (error) {
      console.error("[startUserSignin]", error);
      return { ok: false, errorMessage: mapAuthError(error) };
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const getUserAccountTokens = async (
  id: string
): Promise<UserAccounts> => {
  try {
    const snap = await getDoc(doc(FirebaseDB, "userAccounts", id));
    return normalizeUserAccounts(snap.exists() ? snap.data() : null);
  } catch (error) {
    console.error("[getUserAccountTokens]", error);
    return EMPTY_USER_ACCOUNTS;
  }
};

// Kicks off Spotify OAuth (PKCE). The callback at app/auth/callback.tsx
// reads spotify_primary from AsyncStorage and dispatches linkSpotifyAccount.
export const connectSpotifyAccount = (primary: "0" | "1") => {
  return async (dispatch: AppDispatch): Promise<ThunkResult> => {
    dispatch(setPlaylistLoading(true));
    try {
      const verifier = await getCodeVerifier();
      const challenge = await getChallengeFromVerifier(verifier);
      const redirectUri = Linking.createURL("auth/callback");
      const state = await generateRandomString(16);

      const scope =
        primary === "1"
          ? "user-read-recently-played playlist-modify-private playlist-modify-public user-top-read user-read-private user-read-email"
          : "user-top-read user-read-private";

      await AsyncStorage.multiSet([
        ["spotify_auth_in_progress", "1"],
        ["spotify_code_verifier", verifier],
        ["spotify_auth_state", state],
        ["spotify_primary", primary],
        ["spotify_scope", scope],
      ]);

      const params = {
        response_type: "code",
        client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
        scope,
        code_challenge_method: "S256",
        code_challenge: challenge,
        redirect_uri: redirectUri,
        state,
      };

      const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
        params
      ).toString()}`;

      console.log("[Spotify OAuth] redirectUri =", redirectUri);
      await Linking.openURL(authUrl);

      return { ok: true };
    } catch (error: any) {
      console.error("[connectSpotifyAccount]", error);
      return {
        ok: false,
        errorMessage: error.message ?? "Could not start Spotify auth",
      };
    } finally {
      dispatch(setPlaylistLoading(false));
    }
  };
};
