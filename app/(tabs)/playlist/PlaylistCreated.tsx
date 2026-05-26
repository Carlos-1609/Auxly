import { useAppSelector } from "@/store/hooks";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Redirect, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PlaylistCreated = () => {
  const router = useRouter();
  const lastCreated = useAppSelector((s) => s.playlist.lastCreated);

  // If we landed here without a created playlist (e.g. deep link, refresh), bounce home.
  if (!lastCreated) {
    return <Redirect href="/playlist" />;
  }

  const openInProvider = async () => {
    if (!lastCreated.externalUrl) return;
    await Linking.openURL(lastCreated.externalUrl);
  };

  return (
    <SafeAreaView className="bg-bg-base flex-1">
      <View className="flex-1 px-6 justify-center items-center">
        <View className="h-24 w-24 rounded-full bg-success/15 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={72} color="#72E0A8" />
        </View>

        <Text className="text-text-primary text-2xl font-bold text-center">
          Playlist created
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          {lastCreated.name}
        </Text>
        <Text className="text-text-muted text-center mt-1 text-sm">
          {lastCreated.trackCount} track{lastCreated.trackCount === 1 ? "" : "s"}
        </Text>

        {lastCreated.skippedAccounts.length > 0 ? (
          <View className="w-full mt-6 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <Text className="text-warning font-bold mb-1">
              Skipped {lastCreated.skippedAccounts.length} account
              {lastCreated.skippedAccounts.length === 1 ? "" : "s"}
            </Text>
            {lastCreated.skippedAccounts.map((s) => (
              <Text key={s.accountId} className="text-text-secondary text-sm">
                · {s.displayName} — {s.reason}
              </Text>
            ))}
          </View>
        ) : null}

        <View className="w-full mt-10 gap-y-4">
          <Pressable
            onPress={openInProvider}
            disabled={!lastCreated.externalUrl}
            className={`rounded-xl py-4 flex-row items-center justify-center gap-x-3 ${
              lastCreated.externalUrl ? "bg-[#1DB954]" : "bg-[#1DB954]/40"
            }`}
            style={{
              shadowColor: "#1DB954",
              shadowOpacity: 0.35,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: 8,
            }}
          >
            <FontAwesome5 name="spotify" size={22} color="black" />
            <Text className="text-black font-bold text-[16px]">
              Open in Spotify
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/playlist")}
            className="rounded-xl py-4 items-center bg-bg-card"
          >
            <Text className="text-text-primary font-semibold text-[16px]">
              Back to playlists
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlaylistCreated;
