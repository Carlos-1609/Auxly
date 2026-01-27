import { FirebaseDB } from "@/firebase/firebaseConfig";
import { SpotifyTokens } from "@/types/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { setIsLoading, setUserAccounts } from "../auth/authSlice";
import { getUserAccountTokens } from "../auth/authThunk";
import { AppDispatch, RootState } from "../store";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;

export const refreshSpotifyToken = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setIsLoading(true));
    try {
      const user = getState().auth;
      const refreshToken = user.userAccounts.spotifyTokens?.spotifyRefreshToken;
      if (!refreshToken) {
        return {
          ok: false,
          errorMessage: "Refresh token not found",
        };
      }

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

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Spotify API error:", errorData);
        return {
          ok: false,
          errorMessage: `Spotify API error: ${errorData.error_description || errorData.error || response.statusText}`,
        };
      }

      const tokens = await response.json();

      // Check if we got the required tokens
      if (!tokens.access_token) {
        return {
          ok: false,
          errorMessage: "No access token received from Spotify",
        };
      }

      const expiresAt = Date.now() + tokens.expires_in * 1000;
      const docRef = doc(FirebaseDB, "userAccounts", user.uid);

      // Only update refresh token if a new one was provided
      const updateData: any = {
        "spotifyTokens.spotifyAccessToken": tokens.access_token,
        "spotifyTokens.spotifyTokenExpiresAt": expiresAt,
      };

      if (tokens.refresh_token) {
        updateData["spotifyTokens.spotifyRefreshToken"] = tokens.refresh_token;
      }

      await updateDoc(docRef, updateData);
      const userAccount = await getUserAccountTokens(user.uid);
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
        { merge: true },
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
