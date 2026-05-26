import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAppDispatch } from "@/store/hooks";
import { linkSpotifyAccount } from "@/store/playlists/playlistThunk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const SPOTIFY_REDIRECT_URI = Linking.createURL("auth/callback");

const SPOTIFY_FLAG_KEYS = [
  "spotify_auth_in_progress",
  "spotify_code_verifier",
  "spotify_auth_state",
  "spotify_primary",
  "spotify_scope",
];

const clearSpotifyAuthFlags = () => AsyncStorage.multiRemove(SPOTIFY_FLAG_KEYS);

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

const CallbackScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
        const inProgress = await AsyncStorage.getItem(
          "spotify_auth_in_progress"
        );
        if (inProgress !== "1") {
          router.replace("/playlist");
          return;
        }

        if (!code) {
          await clearSpotifyAuthFlags();
          router.replace("/playlist");
          return;
        }

        const [storedState, storedVerifier, primaryFlag, storedScope] =
          await Promise.all([
            AsyncStorage.getItem("spotify_auth_state"),
            AsyncStorage.getItem("spotify_code_verifier"),
            AsyncStorage.getItem("spotify_primary"),
            AsyncStorage.getItem("spotify_scope"),
          ]);

        if (!storedVerifier) {
          if (!cancelled) setError("Missing code verifier. Try again.");
          await clearSpotifyAuthFlags();
          return;
        }
        if (!storedState || storedState !== state) {
          if (!cancelled) setError("State mismatch. Try again.");
          await clearSpotifyAuthFlags();
          return;
        }

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: storedVerifier,
        }).toString();

        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (!response.ok) {
          console.error("Spotify token exchange failed:", await response.text());
          if (!cancelled) setError("Failed to exchange code for tokens.");
          return;
        }

        const data = (await response.json()) as SpotifyTokenResponse;
        const isPrimary = primaryFlag === "1";

        const result = await dispatch(
          linkSpotifyAccount({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires_in * 1000,
            scopes: storedScope ?? data.scope ?? "",
            isPrimary,
          })
        );

        await clearSpotifyAuthFlags();

        if (!result.ok) {
          if (!cancelled) setError(result.errorMessage);
          return;
        }

        router.replace(isPrimary ? "/playlist" : "/playlist/AddAccounts");
      } catch (err) {
        console.error("Callback error:", err);
        if (!cancelled) setError("Unexpected error handling Spotify callback.");
        await clearSpotifyAuthFlags();
      }
    };

    handleSpotifyCallback();
    return () => {
      cancelled = true;
    };
  }, [code, state, router, dispatch]);

  if (!error) {
    return (
      <LoadingOverlay
        visible={true}
        message="Connecting your Spotify account..."
      />
    );
  }

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
        <View className="flex items-center">
          <TouchableOpacity
            className="bg-error w-20 p-2 rounded-md"
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
