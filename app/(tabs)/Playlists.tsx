import { useAppSelector } from "@/store/hooks";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Playlists = () => {
  const user = useAppSelector((state) => state.auth);
  const test = () => console.log(user);
  return (
    <SafeAreaView>
      <Text>This is the playlist screen</Text>
      <TouchableOpacity onPress={test} className="bg-blue-500">
        <Text className="text-white">Press me</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Playlists;
