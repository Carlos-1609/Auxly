import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DIGITS = 5;

const VerifyCode = () => {
  const [code, setCode] = useState(Array(DIGITS).fill(""));
  const refs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

  const focus = (i: number) => refs.current[i]?.focus();

  const setRef = (i: number) => (el: TextInput | null) => {
    refs.current[i] = el;
  };

  const handleChange = (text: string, i: number) => {
    const cleaned = text.replace(/\D/g, "");
    if (!cleaned) return;

    const next = [...code];
    for (let k = 0; k < cleaned.length && i + k < DIGITS; k++) {
      next[i + k] = cleaned[k];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // mini feedback per digit
    }

    setCode(next);

    if (i + cleaned.length < DIGITS) {
      focus(i + cleaned.length);
    } else {
      Keyboard.dismiss();
      onComplete(next.join(""));
    }
  };

  const handleKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (code[i] === "" && i > 0) {
        focus(i - 1);
      }
      const next = [...code];
      next[i] = "";
      setCode(next);
    }
  };

  const onComplete = (value: string) => {
    console.log("CODE:", value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/auth/ResetPassword");
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-bg-base px-6">
      <Text className="text-white text-lg mb-6 text-center">
        Enter the {DIGITS}-digit code sent to your email
      </Text>

      <View className="flex-row gap-x-4">
        {Array.from({ length: DIGITS }).map((_, i) => (
          <TextInput
            key={i}
            ref={setRef(i)}
            value={code[i]}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            autoCapitalize="none"
            blurOnSubmit={false}
            inputAccessoryViewID={undefined} // ✅ REMOVE ACCESSORY
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            className={`bg-bg-card border py-6 px-7 rounded-xl text-3xl text-white text-center
                        ${code[i] ? "border-gold" : "border-glow-accent"}`}
            placeholder="•"
            placeholderTextColor="#666"
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default VerifyCode;
