import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text } from "react-native";

import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayListModalProps = {
  setPlaylistModal: React.Dispatch<React.SetStateAction<boolean>>;
  showPlaylistModal: boolean;
};

const PlaylistModal = ({
  setPlaylistModal,
  showPlaylistModal,
}: PlayListModalProps) => {
  const insets = useSafeAreaInsets();
  const [showMusicAccounts, setShowMusicAccounts] = useState<boolean>(false);

  const addingAccountHandler = () => {
    setShowMusicAccounts(true);
  };

  return (
    <Modal
      animationType="slide"
      visible={showPlaylistModal}
      transparent
      onRequestClose={() => setPlaylistModal(false)}
    >
      {/* Overlay */}
      <View className="flex-1 bg-black/40 justify-end">
        {/* Bottom sheet card */}
        <View
          className="bg-bg-card rounded-t-3xl px-6 pt-4 flex-1"
          style={{
            maxHeight: "90%",
            paddingBottom: insets.bottom + 20,
          }}
        >
          {/* Drag / close handle */}
          <Pressable
            onPress={() => setPlaylistModal(false)}
            className="items-center mb-3"
            hitSlop={12}
          >
            <View className="h-1 w-12 rounded-full bg-white/20" />
          </Pressable>
          <Pressable
            onPress={addingAccountHandler}
            className="bg-gold h-[55px] w-[55px] rounded-full justify-center items-center absolute right-5 top-5 z-10"
            style={{
              // iOS shadow
              shadowColor: "#FF9671",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 9,

              bottom: insets.bottom + 10,

              // Android shadow
              elevation: 8,
            }}
          >
            <FontAwesome5 name="link" size={24} color="black" />
          </Pressable>

          <Text className="text-text-primary text-lg font-semibold">
            Create Playlist
          </Text>

          <Text className="text-text-secondary mt-2">ALOHA</Text>
          <View className="flex-1 justify-end  ">
            <Pressable className="bg-gold rounded-md py-3 items-center justify-center">
              <Text className="text-black font-bold text-[14px]">
                Create a Playlist
              </Text>
            </Pressable>
            <Pressable className="bg-error rounded-md py-3 items-center justify-center mt-4">
              <Text className="text-black font-bold text-[14px]">
                Cancel Playlist
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      {showMusicAccounts ? (
        <View className="absolute inset-0 items-center justify-center">
          {/* Backdrop (tap outside to close) */}
          <Pressable
            onPress={() => setShowMusicAccounts(false)}
            className="absolute inset-0 bg-black/50"
            style={({ pressed }) => [{ opacity: pressed ? 0.55 : 1 }]}
          />

          {/* Card */}
          <View className="bg-bg-card w-[320px] rounded-2xl px-4 pt-4 pb-5">
            {/* Header row */}
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-lg font-bold">
                Choose a provider
              </Text>

              {/* Close button */}
              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                hitSlop={12}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-warning"
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Close provider picker"
              >
                <Text className="text-warning text-xl ">×</Text>
              </Pressable>
            </View>

            {/* Optional helper text */}
            <Text className="text-text-secondary mt-1 text-sm">
              This will open the provider to connect your account.
            </Text>

            {/* Buttons */}
            <View className="mt-4 gap-y-4">
              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                className="rounded-xl bg-[#1DB954] px-4 py-3 flex-row items-center justify-center gap-x-2"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.92 : 1,
                    shadowColor: "#1DB954",
                    shadowOpacity: 0.35,
                    shadowRadius: 10,
                    elevation: 8,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Connect Spotify"
              >
                <FontAwesome5 name="spotify" size={26} color="black" />
                <Text className="text-text-black text-[16px] font-bold">
                  Spotify
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                className="rounded-xl bg-[#FA2D48] px-4 py-3 flex-row items-center justify-center gap-x-2"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.92 : 1,
                    shadowColor: "#FA2D48",
                    shadowOpacity: 0.35,
                    shadowRadius: 10,
                    elevation: 8,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Connect Apple Music"
              >
                <FontAwesome5 name="apple" size={28} color="white" />
                <Text className="text-white text-[16px] font-bold mt-1">
                  Apple
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                className="rounded-xl bg-[#FF9900] px-4 py-3 flex-row items-center justify-center gap-x-2"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.92 : 1,
                    shadowColor: "#FF9900",
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 8,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Connect Amazon Music"
              >
                <FontAwesome5 name="amazon" size={26} color="black" />
                <Text className="text-text-black text-[16px] font-bold">
                  Amazon
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                className="rounded-xl bg-[#FF0000] px-4 py-3 flex-row items-center justify-center gap-x-2"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.92 : 1,
                    shadowColor: "#FF0000",
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 8,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Connect YouTube Music"
              >
                <FontAwesome5 name="youtube" size={26} color="white" />
                <Text className="text-white text-[16px] font-bold">
                  YouTube
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
  );
};

export default PlaylistModal;
