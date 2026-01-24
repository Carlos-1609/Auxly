import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ConnectedAccounts = () => {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
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
        onPress={() => setConnected(!connected)}
        className="bg-bg-card m-5 p-3 rounded-lg"
      >
        <View className="flex flex-row items-center justify-between">
          <FontAwesome5 name="spotify" size={30} color="#1DB954" />
          <Text className="text-text-primary">Spotify</Text>

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
          <FontAwesome5 name="apple" size={30} color="#fff" />
          <Text className="text-text-primary">Apple Music</Text>
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
          <Text className="text-text-primary">Yotube Music</Text>
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
          <Text className="text-text-primary">Amazon Music</Text>
          <Ionicons
            name={connected ? "checkmark-circle" : "checkmark-circle-outline"}
            size={24}
            color={connected ? "lime" : "grey"}
          />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ConnectedAccounts;
