import {
  connectSpotifyAccount,
  disconnectSpotifyAccount,
} from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ConnectedAccounts = () => {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const userAccounts = useAppSelector((state) => state.auth.userAccounts);
  const [showDialog, setShowDialog] = useState(false);
  const [provider, setProvider] = useState("");
  const dispatch = useAppDispatch();
  //   useEffect(() => {
  //     const getUserAccountTokens = async () => {
  //       console.log("User account tokens from firebase");
  //     };
  //     getUserAccountTokens();
  //   }, []);

  const handleSpotifyConnection = async () => {
    if (userAccounts.spotifyTokens?.spotifyUserID) {
      setProvider("SPOTIFY");
      setShowDialog(true);
    } else {
      dispatch(connectSpotifyAccount(true));
    }
  };

  const handleAccountDisconnect = async () => {
    if (provider === "SPOTIFY") {
      dispatch(disconnectSpotifyAccount());
      setShowDialog(false);
      setProvider("");
    }
    if (provider === "APPLE") {
    }
    if (provider === "YOUTUBE") {
    }
    if (provider === "AMAZON") {
    }
  };
  return (
    <SafeAreaView className="bg-bg-base flex-1 ">
      <View className=" flex-row items-center justify-center p-2">
        <View className="absolute top-1 left-5 bottom-0">
          <Ionicons
            onPress={() => router.back()}
            name="chevron-back"
            size={30}
            color={"orange"}
          ></Ionicons>
        </View>
        <Text className="text-text-primary font-bold text-lg ">
          Connected Accounts
        </Text>
      </View>
      {/* Account Connections */}

      <TouchableOpacity
        id="SPOTIFY"
        onPress={handleSpotifyConnection}
        className="bg-bg-card m-5 p-3 rounded-lg"
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
            color={userAccounts.spotifyTokens?.spotifyUserID ? "lime" : "grey"}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-bg-card m-5 p-3 rounded-lg"
        onPress={() => setConnected(!connected)}
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
        className="bg-bg-card m-5 p-3 rounded-lg"
        onPress={() => setConnected(!connected)}
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
        className="bg-bg-card m-5 p-3 rounded-lg"
        onPress={() => setConnected(!connected)}
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
      {showDialog ? (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <View className="bg-bg-card rounded-2xl w-[280px] overflow-hidden">
            {/* Title */}
            <View className="px-6 pt-8 pb-6">
              <Text className="text-text-primary text-center text-[16px] leading-5 font-bold">
                Disconnect your Spotify account?
              </Text>
            </View>

            {/* Divider */}
            <View className="h-[0.5px] bg-gray-700" />

            {/* Log out button */}
            <Pressable
              onPress={handleAccountDisconnect}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 107, 107, 0.15)" }}
            >
              <Text className="text-error text-center text-[15px] font-bold">
                Disconnect
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

export default ConnectedAccounts;
