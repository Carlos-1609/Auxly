import FormInput from "@/components/ui/FormInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import z from "zod/v3";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must include one uppercase letter")
      .regex(/[0-9]/, "Must include one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const methods = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConf, setIsVisibleConf] = useState(false);

  const onSubmit = methods.handleSubmit((data) => {
    console.log("Submit");
    console.log("Valid:", data);
    router.push("/auth/SignIn");
  });
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-bg-base">
      <ScrollView className="w-full max-w-[520px] px-8 py-6">
        <Text className="text-white text-2xl font-extrabold">
          Choose a new password
        </Text>
        <Text className="text-zinc-400 mt-1 mb-2">
          Make sure it's a strong password.
        </Text>
        <FormProvider {...methods}>
          <View className="gap-y-2">
            <FormInput
              name="password"
              label="Password"
              secureTextEntry={isVisible}
              isIcon={true}
            ></FormInput>
            <TouchableOpacity
              className="absolute right-4 top-[26px] z-10"
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
            <View>
              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                secureTextEntry={isVisibleConf}
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
                  name={isVisibleConf ? "eye" : "eye-off"}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={onSubmit}
            className="bg-gold rounded-md py-3 items-center justify-center mt-3"
          >
            <Text className="text-black font-bold text-lg">
              Update Password
            </Text>
          </TouchableOpacity>
        </FormProvider>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
