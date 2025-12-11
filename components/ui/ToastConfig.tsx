import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BaseToastProps, ToastConfig } from "react-native-toast-message";

type CustomToastProps = BaseToastProps;

const toastConfig: ToastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <>
      <View className="flex-col items-center justify-start w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-5">
        {text1 && (
          <Text className="text-[#D92D20] text-[14px] font-semibold mr-2">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-[#7A271A] text-[13px]">{text2}</Text>}
      </View>
    </>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <>
      <View className="flex-col items-center justify-start w-[90%] h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg mt-5">
        {text1 && (
          <Text className="text-[#067647]  text-[14px] font-semibold mr-2">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#054F31] text-[13px] text-wrap">{text2}</Text>
        )}
      </View>
    </>
  ),
  delete: ({ text1, text2 }: CustomToastProps) => (
    <SafeAreaView>
      <View className="flex-col items-center justify-start w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-5">
        {text1 && (
          <Text className="text-[#D92D20] text-[14px] font-semibold mr-2">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-[#7A271A] text-[13px]">{text2}</Text>}
      </View>
    </SafeAreaView>
  ),
};

export default toastConfig;
