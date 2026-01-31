import PlaylistModal from "@/components/PlaylistModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Playlists = () => {
  const user = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const handleCreatePlaylist = () => {
    // TODO: open modal / bottom sheet to enter playlist name
    console.log("Create playlist pressed");
    setShowPlaylistModal(true);
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
        },
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
        },
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
        },
      );

      //Need song uris
    } catch (error) {
      console.log("Spotify API error:", error);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-bg-base flex-1">
      <ScrollView contentContainerClassName="">
        <Text className="text-text-primary">This is the playlist screen</Text>

        {/* Testing button (you said ignore this) */}
        <Pressable
          onPress={loadRecentSpotifySongs}
          className="bg-red-600 p-4 mt-5 mx-5"
        >
          <Text className="text-text-primary">Load Recent Songs</Text>
        </Pressable>
      </ScrollView>

      {/* Create Playlist FAB */}
      <Pressable
        onPress={handleCreatePlaylist}
        className="h-[58px] w-[58px] rounded-full items-center justify-center absolute right-6 bg-gold"
        style={{
          bottom: insets.bottom + 88, // above tab bar, content scrolls under
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
        }}
        android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="Create new playlist"
      >
        <FontAwesome5 name="plus" size={22} color="#111" />
      </Pressable>
      {showPlaylistModal ? (
        <PlaylistModal
          setPlaylistModal={setShowPlaylistModal}
          showPlaylistModal={showPlaylistModal}
        ></PlaylistModal>
      ) : null}
    </SafeAreaView>
  );
};

export default Playlists;
