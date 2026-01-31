import { FontAwesome5 } from "@expo/vector-icons";
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
            className="items-center mb-4"
          >
            <FontAwesome5 name="chevron-down" size={26} color="#999" />
          </Pressable>
          <Pressable
            className="bg-gold h-[55px] w-[55px] rounded-full justify-center items-center absolute right-5 "
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
        </View>
      </View>
    </Modal>
  );
};

export default PlaylistModal;
