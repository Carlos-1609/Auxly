import { useAppSelector } from "@/store/hooks";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AccountChooser = () => {
  const [providers, setProviders] = useState({
    spotify: {
      active: false,
    },
    apple: {
      active: false,
    },
    youtube: {
      active: false,
    },
    amazon: {
      active: false,
    },
  });
  const router = useRouter();
  const { userAccounts } = useAppSelector((state) => state.auth);
  const [connected, setConnected] = useState(false);
  const [nextEnable, setNextEnable] = useState<boolean>(false);

  const onSelectedHandler = () => {
    setNextEnable(true);
  };
  return (
    <SafeAreaView className="bg-bg-base flex-1 ">
      {/* Header Buttons */}
      <View className="flex-row justify-between mt-2 ">
        <Pressable className="mx-4">
          <Text
            onPress={() => router.back()}
            className="text-error font-bold text-[17px]"
          >
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/playlist/AddAccounts")}
          className="mx-4"
        >
          <Text
            disabled={nextEnable}
            className={`${nextEnable ? "text-success" : "text-success/30"} font-bold text-[17px]`}
          >
            Next
          </Text>
        </Pressable>
      </View>
      {/* Body */}
      <View className="">
        <Text className="text-text-primary text-lg text-center font-bold mt-4">
          Choose an Account to Create the Playlist
        </Text>
        <Text className="text-text-muted text-sm text-center font-bold mt-1 mb-4">
          This is where the playlist will be created
        </Text>
        <TouchableOpacity
          onPress={() => {
            setProviders((prev) => ({
              ...prev,
              apple: {
                ...prev.apple,
                active: false,
              },
              spotify: {
                ...prev.spotify,
                active: !prev.spotify.active,
              },
              youtube: {
                ...prev.youtube,
                active: false,
              },
              amazon: {
                ...prev.amazon,
                active: false,
              },
            }));
            onSelectedHandler();
          }}
          className={`bg-bg-card m-5 p-3 rounded-lg ${providers.spotify.active ? "border-2 border-lime-300" : ""}`}
        >
          <View className="flex flex-row items-center justify-between">
            <FontAwesome5 name="spotify" size={30} color="#1DB954" />
            <View className="flex-col items-center justify-center mt-1">
              <Text className="text-text-primary">Spotify</Text>
              <Text className="text-text-muted text-sm">
                {userAccounts.spotifyTokens?.spotifyUserID
                  ? "Connected"
                  : "Not Connected"}
              </Text>
            </View>

            <Ionicons
              name={
                userAccounts.spotifyTokens?.spotifyUserID
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={24}
              color={
                userAccounts.spotifyTokens?.spotifyUserID ? "lime" : "grey"
              }
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`bg-bg-card m-5 p-3 rounded-lg ${providers.apple.active ? "border-2 border-lime-300" : ""}`}
          onPress={() => {
            setProviders((prev) => ({
              ...prev,
              apple: {
                ...prev.apple,
                active: !prev.apple.active,
              },
              spotify: {
                ...prev.spotify,
                active: false,
              },
              youtube: {
                ...prev.youtube,
                active: false,
              },
              amazon: {
                ...prev.amazon,
                active: false,
              },
            }));

            onSelectedHandler();
          }}
        >
          <View className="flex flex-row items-center justify-between">
            <FontAwesome5 name="apple" size={33} color="#fff" />
            <View className="flex-col items-center justify-center mt-1">
              <Text className="text-text-primary">Apple Music</Text>
              <Text className="text-text-muted text-sm">Not Connected</Text>
            </View>
            <Ionicons
              name={connected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={connected ? "lime" : "grey"}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-bg-card m-5 p-3 rounded-lg ${providers.youtube.active ? "border-2 border-lime-300" : ""}`}
          onPress={() => {
            setProviders((prev) => ({
              ...prev,
              apple: {
                ...prev.apple,
                active: false,
              },
              spotify: {
                ...prev.spotify,
                active: false,
              },
              youtube: {
                ...prev.youtube,
                active: !prev.youtube.active,
              },
              amazon: {
                ...prev.amazon,
                active: false,
              },
            }));
            onSelectedHandler();
          }}
        >
          <View className="flex flex-row items-center justify-between">
            <FontAwesome5 name="youtube" size={30} color="#FF0000" />
            <View className="flex-col items-center justify-center mt-1">
              <Text className="text-text-primary">Youtube Music</Text>
              <Text className="text-text-muted text-sm">Not Connected</Text>
            </View>
            <Ionicons
              name={connected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={connected ? "lime" : "grey"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`bg-bg-card m-5 p-3 rounded-lg ${providers.amazon.active ? "border-2 border-lime-300" : ""}`}
          onPress={() => {
            setProviders((prev) => ({
              ...prev,
              apple: {
                ...prev.apple,
                active: false,
              },
              spotify: {
                ...prev.spotify,
                active: false,
              },
              youtube: {
                ...prev.youtube,
                active: false,
              },
              amazon: {
                ...prev.amazon,
                active: !prev.amazon.active,
              },
            }));
            onSelectedHandler();
          }}
        >
          <View className="flex flex-row items-center justify-between">
            <FontAwesome5 name="amazon" size={30} color="#FF9900" />
            <View className="flex-col items-center justify-center mt-1">
              <Text className="text-text-primary">Amazon Music</Text>
              <Text className="text-text-muted text-sm">Not Connected</Text>
            </View>
            <Ionicons
              name={connected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={connected ? "lime" : "grey"}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AccountChooser;
