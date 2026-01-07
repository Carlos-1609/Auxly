// app/callback.tsx
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
//For production we just use auxly://callback
const SPOTIFY_REDIRECT_URI = Linking.createURL("callback"); // must match what you used before

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
  const { code, state } = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // wrap async logic in a function
    const handleSpotifyCallback = async () => {
      try {
        // 1) Handle error from Spotify (user denied, etc.)
        if (!code) {
          setError("Missing authorization code from Spotify.");
          return;
        }

        // 2) Read stored verifier + state
        const storedVerifier = await AsyncStorage.getItem(
          "spotify_code_verifier"
        );
        const storedState = await AsyncStorage.getItem("spotify_auth_state");

        if ((await AsyncStorage.getItem("spotify_access_token")) !== "") {
          console.log("Spotify Access Token Detected for DEV ONLY");
          router.push("/Playlists");
          return;
        }

        // const accessToken = await AsyncStorage.getItem("")
        console.log("THIS ARE  FROM THE ASYNC STORAGE");
        console.log(storedVerifier);
        console.log(storedState);

        if (!storedVerifier) {
          setError("Missing code_verifier. Please try connecting again.");
          return;
        }

        if (!storedState || storedState !== state) {
          setError("State mismatch. Possible invalid auth response.");
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

        const now = Date.now();
        const expiresAt = now + data.expires_in * 1000;

        // 5) Save tokens (for now in AsyncStorage)
        await AsyncStorage.setItem(
          "spotify_access_token",
          data.access_token ?? ""
        );
        if (data.refresh_token) {
          await AsyncStorage.setItem(
            "spotify_refresh_token",
            data.refresh_token
          );
        }
        await AsyncStorage.setItem(
          "spotify_token_expires_at",
          String(expiresAt)
        );

        // (Optional) Clear verifier & state after success
        // await AsyncStorage.removeItem("spotify_code_verifier");
        // await AsyncStorage.removeItem("spotify_auth_state");

        // 6) Redirect back to Playlists
        router.replace("/Playlists");
      } catch (err) {
        console.log("Callback error:", err);
        setError("Unexpected error handling Spotify callback.");
      }
    };

    handleSpotifyCallback();
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
            onPress={() => router.push("/Playlists")}
          >
            <Text className="text-text-primary font-bold">Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CallbackScreen;
