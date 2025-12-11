import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Playlists = () => {
  const user = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const generateRandomString = async (length: number) => {
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

  const getCodeVerifier = async () => {
    const code = await generateRandomString(64);
    return code;
  };

  const getChallengeFromVerifier = async (verifier: string) => {
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

  const spotifyButtonLink = async () => {
    const verifier = await getCodeVerifier();
    await AsyncStorage.setItem("spotify_code_verifier", verifier);
    const challenge = await getChallengeFromVerifier(verifier);
    // Builidng the URL
    const scope =
      "user-read-recently-played playlist-modify-private playlist-modify-public";
    const redirectUri = Linking.createURL("callback");
    console.log("REDIRECT URI →", redirectUri);
    const state = await generateRandomString(16);
    await AsyncStorage.setItem("spotify_auth_state", state);

    const params = {
      response_type: "code",
      client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
      scope: scope,
      code_challenge_method: "S256",
      code_challenge: challenge,
      redirect_uri: redirectUri,
      state,
    };
    // Turn params object into URL-encoded query string
    const query = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    // Final URL
    const authUrl = `https://accounts.spotify.com/authorize?${query}`;

    // Open Spotify auth page
    await Linking.openURL(authUrl);
  };

  const debugTokens = async () => {
    const a = await AsyncStorage.getItem("spotify_access_token");
    const r = await AsyncStorage.getItem("spotify_refresh_token");
    const e = await AsyncStorage.getItem("spotify_token_expires_at");
    console.log("TOKEN DEBUG →", { a, r, e });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-bg-base flex-1 items-center justify-start"
    >
      <ScrollView>
        <Text className="text-text-primary">This is the playlist screen</Text>
        <Pressable
          onPress={spotifyButtonLink}
          className="bg-green-600 p-4 mt-5 "
        >
          <Text className="text-text-primary">Link Spotify Account</Text>
        </Pressable>
        <Pressable onPress={debugTokens} className="bg-cyan-600 p-4 mt-5 ">
          <Text className="text-text-primary">Check Spotify Tokens</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Playlists;
