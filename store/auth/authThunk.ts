import { FirebaseDB } from "@/firebase/firebaseConfig";
import { userSignInFirebase, userSignUpFirebase } from "@/firebase/providers";
import { UserAccounts } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { AppDispatch, RootState } from "../store";
import { setIsLoading, setUser, setUserAccounts } from "./authSlice";

export const generateRandomString = async (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Get random bytes
  const randomBytes = await Crypto.getRandomBytesAsync(length);

  let text = "";
  for (let i = 0; i < randomBytes.length; i++) {
    text += possible[randomBytes[i] % possible.length];
  }

  return text;
};

export const getCodeVerifier = async () => {
  const code = await generateRandomString(64);
  return code;
};

export const getChallengeFromVerifier = async (verifier: string) => {
  const base64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );

  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64url;
};

export const startUserSignUp = (data: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      console.log("Inside the dispatch");
      dispatch(setIsLoading(true));
      const user = await userSignUpFirebase(data);
      if (!user?.uid) {
        dispatch(setIsLoading(false));
        return false;
      }
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          userAccounts: {},
        }),
      );
      dispatch(setIsLoading(false));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
};

export const startUserSignin = (email: string, password: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch(setIsLoading(true));
      // const user = await userSignInFirebase(email, password);
      const user = await userSignInFirebase(
        "carlosord1609@gmail.com",
        "Honduras_16",
      );
      if (!user?.uid) {
        dispatch(setIsLoading(false));
        return false;
      }
      const userAccounts: UserAccounts = await getUserAccountTokens(user.uid);
      dispatch(
        setUser({
          uid: user.uid,
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          userAccounts: userAccounts,
        }),
      );
      console.log(JSON.stringify({ user, userAccounts }, null, 2));
      return {
        ok: true,
      };
    } catch (error) {
      console.log("Inside the thunk");
      console.error("This was the sign in error: /n", error);
      dispatch(setIsLoading(false));
      return false;
    }
  };
};

export const getUserAccountTokens = async (id: string) => {
  try {
    const docRef = doc(FirebaseDB, "userAccounts", id);
    const query = await getDoc(docRef);
    let userAccounts: UserAccounts;
    if (query.exists()) {
      //console.log("Si existe");
      userAccounts = query.data();
      return userAccounts;
    } else {
      //console.log("No existe");
      userAccounts = {};
      return userAccounts;
    }
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const connectSpotifyAccount = (primary: boolean) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch(setIsLoading(true));

      const verifier = await getCodeVerifier();
      const challenge = await getChallengeFromVerifier(verifier);
      const redirectUri = Linking.createURL("auth/callback");
      const state = await generateRandomString(16);

      await AsyncStorage.multiSet([
        ["spotify_auth_in_progress", "1"],
        ["spotify_code_verifier", verifier],
        ["spotify_auth_state", state],
      ]);

      const scope =
        "user-read-recently-played playlist-modify-private playlist-modify-public user-top-read user-read-private user-read-email";

      const params = {
        response_type: "code",
        client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
        scope,
        code_challenge_method: "S256",
        code_challenge: challenge,
        redirect_uri: redirectUri,
        state,
      };

      const query = new URLSearchParams(params).toString();
      const authUrl = `https://accounts.spotify.com/authorize?${query}`;

      await Linking.openURL(authUrl);

      return { ok: true };
    } catch (error: any) {
      console.log(error);
      return { ok: false, errorMessage: error.message };
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const disconnectSpotifyAccount = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch(setIsLoading(true));
      const uid = getState().auth.uid;
      if (!uid) throw new Error("Missing user uid");
      const docRef = doc(FirebaseDB, "userAccounts", uid);
      const updateData = {
        "spotifyTokens.spotifyAccessToken": "",
        "spotifyTokens.spotifyTokenExpiresAt": 0,
        "spotifyTokens.spotifyRefreshToken": "",
        "spotifyTokens.spotifyUserID": "",
      };
      await updateDoc(docRef, updateData);
      const userAccount = await getUserAccountTokens(uid);
      dispatch(setUserAccounts(userAccount));
      return {
        ok: true,
      };
    } catch (error: any) {
      console.log(error);
      return {
        ok: false,
        errorMessage: error.message,
      };
    } finally {
      dispatch(setIsLoading(false)); // Stop loading regardless of success/failure
    }
  };
};
