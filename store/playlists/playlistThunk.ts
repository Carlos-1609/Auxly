import { FirebaseDB } from "@/firebase/firebaseConfig";
import { SpotifyTokens } from "@/types/auth";
import * as Crypto from "expo-crypto";
import { doc, setDoc } from "firebase/firestore";
import { setIsLoading } from "../auth/authSlice";
import { AppDispatch, RootState } from "../store";

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
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64url;
};

export const storeSpotifyTokens = (spotifyTokens: SpotifyTokens) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      console.log("INSIDE THE STORE SPOTIFY TOKENS THUNK");
      dispatch(setIsLoading(true));
      const user = getState().auth;
      const userResponse = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${spotifyTokens.spotifyAccessToken}`,
        },
      });
      const spotifyUser = await userResponse.json();
      const docRef = doc(FirebaseDB, "userAccounts", user.uid);
      await setDoc(
        docRef,
        {
          "spotifyTokens.spotifyAccessToken": spotifyTokens.spotifyAccessToken,
          "spotifyTokens.spotifyRefreshToken":
            spotifyTokens.spotifyRefreshToken,
          "spotifyTokens.spotifyUserID": spotifyUser.id,
          "spotifyTokens.spotifyTokenExpiresAt":
            spotifyTokens.spotifyTokenExpiresAt,
        },
        { merge: true }
      );
      dispatch(setIsLoading(false));
      return {
        ok: true,
      };
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
      return {
        ok: false,
        errorMessage: error.message,
      };
    }
  };
};
