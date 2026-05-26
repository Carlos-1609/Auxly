import PlaylistModal from "@/components/PlaylistModal";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Playlists = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handleCreatePlaylist = () => {
    router.push("/playlist/AccountChooser");
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-bg-base flex-1">
      <ScrollView>
        <Text className="text-text-primary">This is the playlist screen</Text>
      </ScrollView>

      <Pressable
        onPress={handleCreatePlaylist}
        className="h-[58px] w-[58px] rounded-full items-center justify-center absolute right-6 bg-gold"
        style={{
          bottom: insets.bottom + 88,
          shadowColor: "#FF9671",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5,
          shadowRadius: 9,
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
        />
      ) : null}
    </SafeAreaView>
  );
};

export default Playlists;
