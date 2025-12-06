import EmailModal from "@/components/EmailModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { userSignInFirebase } from "@/firebase/providers";
import { setUser } from "@/store/auth/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const SignIn = () => {
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const dispatch = useDispatch();

  const router = useRouter();

  const onSignIN = async () => {
    setIsLoading(true);
    const user = await userSignInFirebase(userEmail, userPassword);
    setIsLoading(false);

    if (!user) {
      throw Error("Error logging in the user");
    } else {
      dispatch(
        setUser({
          uid: user?.uid ?? "",
          email: user?.email ?? "",
          displayName: user?.displayName ?? "",
        })
      );
      router.replace("/Playlists");
    }
    console.log(JSON.stringify(user, null, 2));

    // setTimeout(() => {
    //   setIsLoading(false);
    //   //router.replace("/Playlists");
    // }, 1000);
  };

  const onChangeHandlerEmail = (e: string) => {
    setUserEmail(e);
  };
  const onChangeHandlerPassword = (e: string) => {
    setUserPassword(e);
  };

  return (
    <SafeAreaView className="bg-bg-base flex-1 items-center justify-start">
      <ScrollView className="w-full max-w-[520px] px-8">
        <View>
          <Image
            className="h-80 w-80 self-center"
            resizeMode="contain"
            source={require("../../assets/images/AuxlyLogo.png")}
          />

          {/* FORM */}
          <View className="gap-y-8">
            <View className="gap-y-1">
              <Text className="text-text-primary text-lg font-bold">Email</Text>
              <View
                className={`bg-bg-input rounded-md border-b-4 shadow-md shadow-black ${
                  isFocusedEmail ? "border-gold" : "border-orange-400"
                }`}
              >
                <TextInput
                  onFocus={() => setIsFocusedEmail(true)}
                  onBlur={() => setIsFocusedEmail(false)}
                  className="text-text-primary py-3 px-3"
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(e) => onChangeHandlerEmail(e)}
                  value={userEmail}
                />
              </View>
            </View>

            <View className="gap-y-1">
              <Text className="text-text-primary text-lg font-bold">
                Password
              </Text>

              <View
                className={`bg-bg-input rounded-md border-b-4 shadow-md shadow-black ${
                  isFocusedPass ? "border-gold" : "border-orange-400"
                }`}
              >
                <TextInput
                  onFocus={() => setIsFocusedPass(true)}
                  onBlur={() => setIsFocusedPass(false)}
                  className="text-text-primary py-3 px-3 pr-10"
                  placeholder="Password" // (typo fixed)
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!isVisible}
                  autoCapitalize="none"
                  onChangeText={(e) => onChangeHandlerPassword(e)}
                  value={userPassword}
                ></TextInput>
                <TouchableOpacity
                  className="absolute right-3 top-2 z-10"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsVisible(!isVisible);
                  }}
                >
                  <Ionicons
                    color="gold"
                    name={isVisible ? "eye" : "eye-off"}
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              className="items-end"
              onPress={() => setModalOpen(true)}
            >
              <Text className="text-gold font-semibold">Forgot Passowrd?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSignIN}
              className="bg-gold rounded-md py-3 items-center justify-center"
            >
              <Text className="text-black font-bold text-lg">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* DIVIDER (same width as form) */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-white/20" />
            <Text className="text-text-primary/50 mx-3 text-sm">
              or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-white/20" />
          </View>

          {/* SOCIALS (same width as form) */}
          <View className="gap-y-5 mt-2">
            <TouchableOpacity className="h-12 rounded-2xl bg-black flex-row items-center justify-center gap-x-3 shadow-md shadow-black/30 active:opacity-80">
              <Image
                source={require("../../assets/images/appleIcon.png")}
                className="h-5 w-5"
              />
              <Text className="text-white font-semibold">
                Sign in with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="h-12 rounded-2xl bg-white border border-gray-200 flex-row items-center justify-center gap-x-3 shadow-md shadow-black/30 active:opacity-80">
              <Image
                source={require("../../assets/images/googleIcon.png")}
                className="h-5 w-5"
              />
              <Text className="text-black font-semibold">
                Sign in with Google
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-text-primary/60">
              Don’t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/SignUp")}>
              <Text className="text-gold font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <LoadingOverlay visible={isLoading} message="Signing you in..." />
      {/* Modal For password recovery */}
      <EmailModal
        isOpen={modalOpen}
        onBackdropPress={() => setModalOpen(false)}
        blurIntensity={35} //
        scrimOpacity={0.45} //
      >
        <View
          className="bg-bg-card/98 rounded-2xl w-[320px] p-5 gap-y-4
                 border border-white/10 shadow-2xl"
          style={{ elevation: 12 }}
        >
          <TouchableOpacity
            className="absolute top-2 right-2 z-10"
            onPress={() => setModalOpen(false)}
          >
            <Ionicons name="close" color="red" size={24} />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-extrabold">
              Recover your password
            </Text>
            <Text className="text-zinc-400 mt-1">It only takes a minute.</Text>
          </View>
          <View
            className={`bg-bg-input rounded-md border-b-4 shadow-md shadow-black ${"border-orange-400"}`}
          >
            <TextInput
              className="text-text-primary py-3 px-3"
              placeholder="Email"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity
            className="bg-gold rounded-md py-3 items-center justify-center mt-3"
            onPress={() => {
              setModalOpen(false);
              router.push("/auth/VerifyCode");
            }}
          >
            <Text className="text-black font-bold text-lg">Continue</Text>
          </TouchableOpacity>
        </View>
      </EmailModal>
    </SafeAreaView>
  );
};

export default SignIn;
