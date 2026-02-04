import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreatePlaylist = () => {
  const router = useRouter();

  const [playlistName, setPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const canCreate = playlistName.trim().length > 0 && !isCreating;

  const handleCreatePlaylist = async () => {
    if (!canCreate) return;

    try {
      setIsCreating(true);

      console.log("Simulating playlist creation…");

      // Simulated API delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Playlist created:", playlistName.trim());

      // Optional: navigate after success
      // router.replace("/playlist/success");
    } catch (err) {
      console.log("Create playlist error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="bg-bg-base flex-1">
      {/* Header */}
      <View className="flex-row justify-between mt-2 mb-2">
        <Pressable className="mx-4" onPress={() => router.back()}>
          <Text className="text-error font-bold text-[17px]">Back</Text>
        </Pressable>
      </View>

      {/* Title */}
      <View className="mx-5 mt-2 mb-4">
        <Text className="text-text-primary text-xl font-bold">
          Name your playlist
        </Text>
        <Text className="text-text-muted mt-1">
          Give it a name and we’ll build it from your linked accounts.
        </Text>
      </View>

      {/* Input */}
      <View className="mx-5">
        <Text className="text-text-primary text-md font-bold mb-2">
          Playlist name
        </Text>

        <View
          className={`bg-bg-input rounded-xl px-4 py-3 flex-row items-center border ${
            isFocused ? "border-outline-active" : "border-white/10"
          }`}
          style={{
            elevation: 6,
            shadowColor: "#FF9671",
            shadowOpacity: isFocused ? 0.35 : 0.18,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <TextInput
            className="text-text-primary flex-1 pr-3 text-[16px]"
            placeholder="Playlist Name"
            placeholderTextColor="#8A8A8A"
            autoCapitalize="words"
            returnKeyType="done"
            value={playlistName}
            onChangeText={setPlaylistName}
            editable={!isCreating}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleCreatePlaylist}
          />

          <FontAwesome5 name="music" size={18} color="#FFD580" />
        </View>

        <Text className="text-text-muted mt-2 text-sm">
          Example: Road Trip 2026
        </Text>
      </View>

      {/* CTA */}
      <View className="flex-1 justify-end">
        <View className="mx-5 mb-6">
          <Pressable
            onPress={handleCreatePlaylist}
            disabled={!canCreate}
            className={`rounded-xl p-4 items-center ${
              canCreate ? "bg-coral" : "bg-coral/60 "
            }`}
            style={{
              elevation: 8,
              shadowColor: "#FF6B6B",
              shadowOpacity: 0.35,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            {isCreating ? (
              <View className="flex-row items-center gap-x-3">
                <ActivityIndicator color="#1B1A1E" />
                <Text className="text-bg-base font-bold text-[16px]">
                  Creating…
                </Text>
              </View>
            ) : (
              <Text className="text-bg-base font-bold text-[16px]">
                Create playlist
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/playlist")}
            className="items-center mt-4"
            disabled={isCreating}
          >
            <Text className="text-text-secondary">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreatePlaylist;
