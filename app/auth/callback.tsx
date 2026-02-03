// app/callback.tsx
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { setUserAccounts } from "@/store/auth/authSlice";
import { getUserAccountTokens } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { storeSpotifyTokens } from "@/store/playlists/playlistThunk";
import { SpotifyTokens } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
//For production we just use auxly://callback
const SPOTIFY_REDIRECT_URI = Linking.createURL("auth/callback"); // must match what you used before

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  uid: string;
};

const CallbackScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const { code, state } = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleSpotifyCallback = async () => {
      try {
        // ✅ If user didn't start linking, this is a dev deep-link restore. Leave quietly.
        const inProgress = await AsyncStorage.getItem(
          "spotify_auth_in_progress",
        );
        if (inProgress !== "1") {
          router.replace("/playlist"); // or "/auth" if not logged in
          return;
        }

        // ✅ If Spotify didn't send a code, also leave quietly (dev reload / stale link)
        if (!code) {
          await AsyncStorage.multiRemove([
            "spotify_auth_in_progress",
            "spotify_code_verifier",
            "spotify_auth_state",
            "spotify_primary",
          ]);
          router.replace("/playlist");
          return;
        }

        const storedState = await AsyncStorage.getItem("spotify_auth_state");
        const storedVerifier = await AsyncStorage.getItem(
          "spotify_code_verifier",
        );
        const primary = await AsyncStorage.getItem("spotify_primary");

        // If something is missing during an active flow, show real error
        if (!storedVerifier) {
          if (!cancelled)
            setError("Missing code_verifier. Please try connecting again.");
          await AsyncStorage.multiRemove([
            "spotify_auth_in_progress",
            "spotify_code_verifier",
            "spotify_auth_state",
            "spotify_primary",
          ]);
          return;
        }

        if (!storedState || storedState !== state) {
          if (!cancelled)
            setError("State mismatch. Please try connecting again.");
          await AsyncStorage.multiRemove([
            "spotify_auth_in_progress",
            "spotify_code_verifier",
            "spotify_auth_state",
            "spotify_primary",
          ]);
          return;
        }

        // 3) Build form data for token request
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: storedVerifier,
        }).toString();

        // 4) Call Spotify token endpoint
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!response.ok) {
          const text = await response.text();
          console.log("Spotify token error:", text);
          setError("Failed to exchange code for tokens.");
          return;
        }

        const data = (await response.json()) as SpotifyTokenResponse;
        console.log("THIS IS THE DATA FROM SPOTIFY: ", data);

        const now = Date.now();
        const tokenExpiresAt = now + data.expires_in * 1000; //token lasts for 1h
        const spotifyTokens: SpotifyTokens = {
          spotifyAccessToken: data.access_token,
          spotifyRefreshToken: data.refresh_token,
          spotifyTokenExpiresAt: tokenExpiresAt,
        };

        // 5) Save tokens for primary user
        if (primary === "1") {
          console.log("THIS IS A PRIMARY ACCOUNT");
          dispatch(storeSpotifyTokens(spotifyTokens));
          const userAccounts = await getUserAccountTokens(user.uid);
          dispatch(setUserAccounts(userAccounts));
        } else {
          //Save the secondary account tokens
          console.log("THIS IS A SECONDARY ACCOUNT");
        }

        // ✅ On success, clear the flags so callback can't re-run accidentally later
        await AsyncStorage.multiRemove([
          "spotify_auth_in_progress",
          "spotify_code_verifier",
          "spotify_auth_state",
          "spotify_primary",
        ]);

        router.replace("/playlist");
      } catch (err) {
        console.log("Callback error:", err);
        if (!cancelled) setError("Unexpected error handling Spotify callback.");
        await AsyncStorage.multiRemove([
          "spotify_auth_in_progress",
          "spotify_code_verifier",
          "spotify_auth_state",
          "spotify_primary",
        ]);
      }
    };

    handleSpotifyCallback();
    return () => {
      cancelled = true;
    };
  }, [code, state, router]);

  // While loading / exchanging tokens
  if (!error) {
    return (
      <LoadingOverlay
        visible={true}
        message="Connecting your Spotify account..."
      />
    );
  }

  // On error
  return (
    <SafeAreaView className="flex-1 bg-bg-base items-center justify-center">
      <View className="px-6">
        <Text className="text-text-primary text-lg font-semibold mb-2">
          Spotify connection failed
        </Text>
        <Text className="text-text-secondary mb-4">{error}</Text>
        <Text className="text-text-muted text-sm">
          Try going back to the Playlists screen and tapping “Connect Spotify”
          again.
        </Text>
        <View className="flex items-center ">
          <TouchableOpacity
            className="bg-error w-20 p-2 rounded-md "
            onPress={() => router.replace("/playlist")}
          >
            <Text className="text-text-primary font-bold">Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CallbackScreen;
