// components/ui/FormInput.tsx
import { useController, useFormContext } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

type FormInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  isVisible?: boolean;
  isIcon?: boolean;
};

const FormInput = ({
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  isIcon = false,
}: FormInputProps) => {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error }, // ← get the error directly here
  } = useController({ control, name });

  return (
    <View className="mb-4">
      <Text className="text-text-primary text-md font-bold mb-1">{label}</Text>

      <View
        className={`bg-bg-input rounded-md border-b-4 shadow-md shadow-black ${
          error ? "border-error" : "border-dark-orange"
        }`}
      >
        <TextInput
          className={`text-text-primary py-3 px-3 ${isIcon ? "pr-12" : ""}`}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          autoCapitalize="none"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          value={String(field.value ?? "")}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          returnKeyType="next"
        />
      </View>

      {error?.message ? (
        <Text className="text-error mt-1">{error.message}</Text>
      ) : null}
    </View>
  );
};

export default FormInput;
