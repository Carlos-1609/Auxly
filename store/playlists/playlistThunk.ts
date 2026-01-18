import { FirebaseDB } from "@/firebase/firebaseConfig";
import { SpotifyTokens } from "@/types/auth";
import * as Crypto from "expo-crypto";
import { doc, setDoc } from "firebase/firestore";
import { setIsLoading } from "../auth/authSlice";
import { AppDispatch, RootState } from "../store";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;

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

export const refreshSpotifyToken = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const user = getState().auth;
      const refreshToken = user.userAccounts.spotifyTokens?.spotifyRefreshToken;
      if (!refreshToken) {
        return {
          ok: false,
          errorMessage: "Refresh token not found",
        };
      }

      console.log("This is the refresh token: ", refreshToken);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: SPOTIFY_CLIENT_ID,
        }).toString(),
      });
      const tokens = await response.json();
      console.log("This are the tokens: ");
      console.log(tokens);
      return {
        ok: true,
      };
    } catch (error: any) {
      console.log(error);
      return {
        ok: false,
        errorMessage: error.message,
      };
    }
  };
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
          spotifyTokens: {
            spotifyAccessToken: spotifyTokens.spotifyAccessToken,
            spotifyRefreshToken: spotifyTokens.spotifyRefreshToken,
            spotifyUserID: spotifyUser.id,
            spotifyTokenExpiresAt: spotifyTokens.spotifyTokenExpiresAt,
          },
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
