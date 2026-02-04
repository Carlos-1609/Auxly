//import { SignupValues, signupSchema } from "@/schemas/auth";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { startUserSignUp } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import z from "zod/v3";
import FormInput from "../../components/ui/FormInput";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must include one uppercase letter")
      .regex(/[0-9]/, "Must include one number"),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .trim()
      .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Only letters, spaces, and hyphens allowed"),
    lastName: z
      .string()
      .trim()
      .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Only letters, spaces, and hyphens allowed"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // attach error to the confirmPassword field
  });

type SignupValues = z.infer<typeof signupSchema>;

const SignUp = () => {
  const router = useRouter();
  const methods = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isVisibleConf, setIsVisibleConf] = useState(true);
  // const dispatch = useDispatch();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const onSubmit = methods.handleSubmit(async (data) => {
    const ok = await dispatch(startUserSignUp(data));
    if (!ok) {
      console.log("An error occured with creating the user");
      return;
    }
    router.replace("/playlist");
  });

  return (
    <SafeAreaView className="bg-bg-base flex-1 items-center justify-start">
      <ScrollView className="w-full max-w-[520px] px-8 py-6">
        <FormProvider {...methods}>
          <View className="gap-2">
            <Text className="text-white text-2xl font-extrabold">
              Create your account
            </Text>
            <Text className="text-zinc-400 mt-1">It only takes a minute.</Text>

            <FormInput
              name="firstName"
              label="Name"
              placeholder="Enter Your Name..."
            />
            <FormInput
              name="lastName"
              label="Last Name"
              placeholder="Enter Your Last Name..."
            />
            <FormInput
              name="email"
              label="Email"
              placeholder="email@email.com"
              keyboardType="email-address"
            />
            <View>
              <FormInput
                name="password"
                label="Password"
                placeholder="••••••••"
                secureTextEntry={isVisible}
                isIcon={true}
              />
              <TouchableOpacity
                className="absolute right-4 top-[26px] z-10"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsVisible(!isVisible);
                }}
              >
                <Ionicons
                  color="gold"
                  name={isVisible ? "eye-off" : "eye"}
                  size={24}
                />
              </TouchableOpacity>
            </View>

            <View>
              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                secureTextEntry={isVisibleConf}
                isIcon={true}
              />
              <TouchableOpacity
                className="absolute right-4 top-[26px] z-10"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsVisibleConf(!isVisibleConf);
                }}
              >
                <Ionicons
                  color="gold"
                  name={isVisibleConf ? "eye-off" : "eye"}
                  size={24}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onSubmit}
              className="bg-gold rounded-md py-3 items-center justify-center mt-3"
            >
              <Text className="text-black font-bold text-lg">Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-end"
              onPress={() => router.replace("/auth/SignIn")}
            >
              <Text className="text-gold font-semibold">
                Already Have An Account?
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-white/20" />
            <Text className="text-text-primary/50 mx-3 text-sm">
              or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-white/20" />
          </View>
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

            <TouchableOpacity className="h-12 rounded-2xl bg-white border border-gray-200 flex-row items-center justify-center gap-x-3 shadow-md shadow-black/30 active:opacity-80 ">
              <Image
                source={require("../../assets/images/googleIcon.png")}
                className="h-5 w-5"
              />
              <Text className="text-black font-semibold">
                Sign in with Google
              </Text>
            </TouchableOpacity>
          </View>
        </FormProvider>
      </ScrollView>
      <LoadingOverlay visible={isLoading} message="Creating your account..." />
    </SafeAreaView>
  );
};

export default SignUp;
