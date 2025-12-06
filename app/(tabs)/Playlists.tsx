import { RootState } from "@/store/store";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const Playlists = () => {
  const user = useSelector((state: RootState) => state.auth);
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
