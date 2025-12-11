import { userLogoutFirebase } from "@/firebase/providers";
import { clearUser } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Playlists = () => {
  const user = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const test = () => console.log(user);
  const logout = async () => {
    await userLogoutFirebase();
    dispatch(clearUser());
    router.push("/auth/SignIn");
  };
  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-bg-base flex-1 items-center justify-start"
    >
      <ScrollView>
        <Text>This is the playlist screen</Text>
        <TouchableOpacity onPress={test} className="bg-blue-500 mt-3 p-5 mx-3">
          <Text className="text-white">Check User</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} className="bg-red-500 mt-5 p-5 mx-3">
          <Text className="text-white">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Playlists;
