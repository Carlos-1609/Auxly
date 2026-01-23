import SettingsItem from "@/components/ui/SettingsItem";
import { userLogoutFirebase } from "@/firebase/providers";
import { clearUser } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const user = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const test = () => console.log(user);
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const logout = async () => {
    setShowLogout(false);
    await AsyncStorage.clear();
    await userLogoutFirebase();
    dispatch(clearUser());
    router.push("/auth/SignIn");
  };
  // source={require("../../assets/images/USERIMG.jpg")}
  return (
    <SafeAreaView edges={["top"]} className="bg-bg-base flex-1 ">
      <ScrollView contentContainerClassName="px-6 items-center">
        <View className="bg-bg-card rounded-full overflow-hidden w-40 h-40 border-4 border-gold">
          <Image
            source={{ uri: "https://picsum.photos/400/300" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="items-center mt-2 mb-2">
          <Text className="text-text-primary ">{user.displayName}</Text>
          <Text className="text-text-muted">{user.email}</Text>
        </View>

        <View>
          <View className="mt-1">
            <Text className="text-text-primary font-bold">ACCOUNT</Text>
          </View>
          <SettingsItem
            icon="person-circle-outline"
            title="Profile Settings"
            subtitle="Update and modify your profile"
          />

          <SettingsItem
            icon="lock-closed-outline"
            title="Privacy"
            subtitle="Change your password"
            onPress={() => {}}
          />
        </View>
        <View>
          <View className="mt-1">
            <Text className="text-text-primary font-bold">CONNECTIONS</Text>
          </View>
          <SettingsItem
            icon="musical-notes-outline"
            title="Connected Accounts"
            subtitle="Manage linked music services"
          />
        </View>

        <View>
          <View className="mt-1">
            <Text className="text-text-primary font-bold">SESSION</Text>
          </View>
          <Pressable
            onPress={() => setShowLogout(true)}
            className="bg-bg-card rounded-lg flex-row items-center my-4 py-3 px-4 w-full"
            android_ripple={{ color: "rgba(255, 107, 107, 0.15)" }}
            style={{
              shadowColor: "#FF6B6B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.18,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <View className="bg-error/15 rounded-lg p-3">
              <Ionicons name={"log-out-outline"} size={24} color="red" />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-text-primary text-[16px] font-semibold">
                Logout
              </Text>
              <Text
                className="text-text-secondary text-[13px]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Sign out of your account
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="red" />
          </Pressable>
        </View>
      </ScrollView>
      {showLogout && (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <View className="bg-bg-card rounded-2xl w-[280px] overflow-hidden">
            {/* Title */}
            <View className="px-6 pt-8 pb-6">
              <Text className="text-text-primary text-center text-[16px] leading-5 font-bold">
                Log out of your account?
              </Text>
            </View>

            {/* Divider */}
            <View className="h-[0.5px] bg-gray-700" />

            {/* Log out button */}
            <Pressable
              onPress={logout}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 107, 107, 0.15)" }}
            >
              <Text className="text-error text-center text-[15px] font-bold">
                Log out
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="h-[0.5px] bg-gray-700" />

            {/* Cancel button */}
            <Pressable
              onPress={() => setShowLogout(false)}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text className="text-text-primary text-center text-[15px] font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;
