import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddAccounts = () => {
  const router = useRouter();
  const [nextEnable, setNextEnable] = useState<boolean>(false);

  return (
    <SafeAreaView className="bg-bg-base flex-1">
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
      <View className="flex-1 justify-center items-center ">
        <Text className="text-text-primary text-lg text-center">
          Choose an Account to create the Playlist
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AddAccounts;
