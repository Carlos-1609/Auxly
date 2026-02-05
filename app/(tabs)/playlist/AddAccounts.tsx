import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const AddAccounts = () => {
  const router = useRouter();
  const [nextEnable, setNextEnable] = useState<boolean>(false);
  const [showMusicAccounts, setShowMusicAccounts] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const accountData = [
    { id: "1", name: "Alejandra Lopez", type: "spotify" },
    { id: "2", name: "Spike", type: "youtube" },
    { id: "3", name: "Travis", type: "apple" },
    { id: "4", name: "Chispitas", type: "amazon" },
  ];

  const addSecondaryAccountHandler = () => {
    setShowMusicAccounts(true);
  };

  const removeAccountHandler = () => {
    setShowDialog(true);
  };

  return (
    <SafeAreaView className="bg-bg-base flex-1">
      <View className="flex-row justify-between mt-2 mb-2">
        <Pressable className="mx-4">
          <Text
            onPress={() => router.back()}
            className="text-error font-bold text-[17px]"
          >
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/playlist/CreatePlaylist")}
          className="mx-4"
          disabled={accountData.length <= 0}
        >
          <Text
            className={`${accountData.length <= 0 ? "text-success/30" : "text-success"} font-bold text-[17px]`}
          >
            Next
          </Text>
        </Pressable>
      </View>
      {accountData.length !== 0 ? (
        <FlatList
          className="pt-10"
          data={accountData}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-7"></View>}
          renderItem={({ item, index }) => (
            <View
              className="bg-bg-card rounded-xl p-4 mx-5"
              style={{
                shadowColor: "#000000",
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <View className="flex-row items-center gap-x-4">
                {/* Provider Icon #FA2D48  #FF9900 #FF0000*/}

                <FontAwesome5
                  name={item.type}
                  size={item.type === "apple" ? 34 : 30}
                  color={
                    item.type === "spotify"
                      ? "#1DB954"
                      : item.type === "apple"
                        ? "#fff"
                        : item.type === "youtube"
                          ? "#FF0000"
                          : "#FF9900"
                  }
                />

                {/* Text Content */}
                <View className="flex-1">
                  <Text className="text-text-primary font-medium">
                    {item.name}
                  </Text>
                  <Text className="text-text-muted text-sm">Connected</Text>
                </View>

                {/* Delete Action */}
                <Pressable hitSlop={10} onPress={() => removeAccountHandler()}>
                  <FontAwesome5 name="trash-alt" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          )}
        ></FlatList>
      ) : (
        <View className="flex-1 justify-center items-center ">
          <Text className="text-text-primary text-lg text-center">
            Add secondary accounts
          </Text>
          <Text className="text-text-muted">
            Link other accounts to add their songs to this playlist.
          </Text>
        </View>
      )}
      <Pressable
        onPress={addSecondaryAccountHandler}
        className="h-[58px] w-[58px] rounded-full items-center justify-center absolute right-6 bg-gold"
        style={{
          bottom: insets.bottom + 5, // above tab bar, content scrolls under
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
      {showDialog ? (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <View className="bg-bg-card rounded-2xl w-[280px] overflow-hidden">
            {/* Title */}
            <View className="px-6 pt-8 pb-6">
              <Text className="text-text-primary text-center text-[16px] leading-5 font-bold">
                Do you want to remove this account?
              </Text>
            </View>

            {/* Divider */}
            <View className="h-[0.5px] bg-gray-700" />

            {/* Remove button */}
            <Pressable
              //onPress={handleAccountDisconnect}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 107, 107, 0.15)" }}
            >
              <Text className="text-error text-center text-[15px] font-bold">
                Remove
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="h-[0.5px] bg-gray-700" />

            {/* Cancel button */}
            <Pressable
              onPress={() => setShowDialog(false)}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text className="text-text-primary text-center text-[15px] font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default AddAccounts;
