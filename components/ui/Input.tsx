import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILIES,
  FONT_SIZES,
  SPACING,
} from "../../utils/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "outlined" | "filled" | "clean";
  helper?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  variant = "outlined",
  helper,
  required = false,
  value,
  placeholder,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  useEffect(() => {
    if (error) {
      // Shake animation for errors
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    textInputProps.onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setHasValue(!!text);
    textInputProps.onChangeText?.(text);
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return variant === "clean" ? "transparent" : COLORS.gray[300];
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "filled":
        return isFocused ? COLORS.white : COLORS.gray[50];
      case "clean":
        return isFocused ? "rgba(59, 130, 246, 0.05)" : COLORS.gray[50];
      default:
        return COLORS.white;
    }
  };

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error
        ? COLORS.error
        : variant === "clean"
        ? "transparent"
        : COLORS.gray[300],
      error ? COLORS.error : COLORS.primary,
    ],
  });

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      getBackgroundColor(),
      variant === "clean" ? "rgba(59, 130, 246, 0.05)" : COLORS.white,
    ],
  });

  const shadowOpacity = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  const inputStyles = [
    styles.input,
    styles[variant],
    leftIcon ? styles.inputWithLeftIcon : null,
    rightIcon ? styles.inputWithRightIcon : null,
    {
      fontSize: FONT_SIZES.base,
      fontFamily:
        hasValue || isFocused
          ? FONT_FAMILIES.inter.medium
          : FONT_FAMILIES.inter.regular,
    },
    style,
  ].filter((s): s is NonNullable<typeof s> => s != null);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, error && styles.labelError]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <Animated.View style={[{ transform: [{ translateX: shakeAnimation }] }]}>
        <Pressable onPress={handleContainerPress}>
          <View style={styles.inputContainer}>
            {leftIcon && (
              <View style={[styles.leftIcon, { opacity: isFocused ? 1 : 0.6 }]}>
                {leftIcon}
              </View>
            )}

            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  borderColor,
                  backgroundColor,
                  shadowColor: COLORS.primary,
                  shadowOpacity,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  elevation: isFocused ? 4 : 0,
                },
                variant === "clean" && styles.cleanWrapper,
              ]}
            >
              <TextInput
                ref={inputRef}
                style={inputStyles}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChangeText={handleChangeText}
                placeholderTextColor={COLORS.gray[400]}
                placeholder={isFocused ? placeholder : placeholder}
                value={value}
                selectionColor={COLORS.primary}
                {...textInputProps}
              />
            </Animated.View>

            {rightIcon && (
              <View
                style={[styles.rightIcon, { opacity: isFocused ? 1 : 0.6 }]}
              >
                {rightIcon}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      {/* Error or Helper Text */}
      {(error || helper) && (
        <View style={styles.messageContainer}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : helper ? (
            <Text style={styles.helperText}>{helper}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },

  labelContainer: {
    marginBottom: SPACING.xs,
  },

  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.inter.semibold,
    color: COLORS.gray[700],
    letterSpacing: 0.2,
  },

  labelError: {
    color: COLORS.error,
  },

  required: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },

  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },

  inputWrapper: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    minHeight: 52,
    justifyContent: "center",
  },

  cleanWrapper: {
    borderWidth: 0,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[50],
  },

  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.inter.regular,
    color: COLORS.gray[900],
    minHeight: 20,
    textAlignVertical: "center",
  },

  // Variants
  default: {
    backgroundColor: COLORS.white,
  },

  outlined: {
    backgroundColor: COLORS.white,
  },

  filled: {
    backgroundColor: COLORS.gray[50],
  },

  clean: {
    backgroundColor: "transparent",
  },

  inputWithLeftIcon: {
    paddingLeft: 48,
  },

  inputWithRightIcon: {
    paddingRight: 48,
  },

  leftIcon: {
    position: "absolute",
    left: SPACING.md,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  rightIcon: {
    position: "absolute",
    right: SPACING.md,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  messageContainer: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },

  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.inter.medium,
    color: COLORS.error,
    letterSpacing: 0.1,
  },

  helperText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.inter.regular,
    color: COLORS.gray[500],
    letterSpacing: 0.1,
  },
});
