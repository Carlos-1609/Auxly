import { FirebaseDB } from "@/firebase/firebaseConfig";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  generateRandomString,
  getChallengeFromVerifier,
  getCodeVerifier,
} from "@/store/playlists/playlistThunk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Playlists = () => {
  const user = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const spotifyButtonLink = async () => {
    const verifier = await getCodeVerifier();
    await AsyncStorage.setItem("spotify_code_verifier", verifier);
    const challenge = await getChallengeFromVerifier(verifier);
    // Builidng the URL
    const scope =
      "user-read-recently-played playlist-modify-private playlist-modify-public user-top-read user-read-private user-read-email";
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
      state: state,
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
    const uid = await AsyncStorage.getItem("spotify_user_id");
    console.log("TOKEN DEBUG →", { a, r, e, uid });
  };

  const loadRecentSpotifySongs = async () => {
    try {
      const token = user.userAccounts.spotifyTokens?.spotifyAccessToken;
      if (!token) {
        console.log("Error no token has been found");
        return;
      }

      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tracks = await response.json();
      console.log("This are the spotify tracks: ", tracks.items);
      const trackList = tracks.items.map((trackInfo: any, index: number) => {
        return trackInfo.uri;
      });
      console.log("These are the songs uris: ", trackList);

      //Generate the Playlist
      const body = {
        name: "Test Playlist",
        description: "New playlist description",
        public: false,
      };

      const playlistResponse = await fetch(
        `https://api.spotify.com/v1/users/${user.userAccounts.spotifyTokens?.spotifyUserID}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const playlist = await playlistResponse.json();
      console.log("This is the playlists id: ", playlist.id);

      //Add the songs to the playlist
      await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: trackList }),
        }
      );

      //Need song uris
    } catch (error) {
      console.log("Spotify API error:", error);
    }
  };

  const firebaseTest = async () => {
    //const querySnapShot = await getDocs(collection(FirebaseDB, "userAccounts"));
    // const test = querySnapShot.docs.map((doc) => {
    //   return doc.data();
    // });
    // console.log(...test);
    const docRef = doc(
      FirebaseDB,
      "userAccounts",
      "bQHe55nahtM2Ci12sUEENxyibd72"
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
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
        <Pressable
          onPress={loadRecentSpotifySongs}
          className="bg-red-600 p-4 mt-5 "
        >
          <Text className="text-text-primary">Load Recent Songs</Text>
        </Pressable>
        <Pressable onPress={firebaseTest} className="bg-orange-400 p-4 mt-5 ">
          <Text className="text-text-primary font-bold">Firebase Test</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Playlists;
