import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILIES,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "../../utils/constants";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "gradient"
    | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size={size === "small" ? "small" : "small"}
          color={getLoaderColor()}
          style={styles.loader}
        />
      )}
      {!loading && leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={textStyles} numberOfLines={1}>
        {loading ? getLoadingText() : title}
      </Text>
      {!loading && rightIcon && (
        <View style={styles.rightIcon}>{rightIcon}</View>
      )}
    </View>
  );

  const getLoaderColor = () => {
    switch (variant) {
      case "primary":
      case "gradient":
      case "danger":
        return COLORS.white;
      case "secondary":
        return COLORS.white;
      case "outline":
      case "ghost":
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  const getLoadingText = () => {
    return title.includes("Sign") ? "Signing in..." : "Loading...";
  };

  if (variant === "gradient") {
    return (
      <Animated.View
        style={[
          styles.base,
          styles[size],
          disabled && styles.disabled,
          fullWidth && styles.fullWidth,
          style,
          { transform: [{ scale: animatedValue }] },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.pressable}
        >
          <LinearGradient
            colors={
              disabled
                ? [COLORS.gray[300], COLORS.gray[400]]
                : [COLORS.primary, "#8B5CF6", "#EC4899"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  pressable: {
    width: "100%",
    height: "100%",
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.small,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  danger: {
    backgroundColor: COLORS.error,
    ...SHADOWS.medium,
    shadowColor: COLORS.error,
    shadowOpacity: 0.3,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.large,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
  },

  // Sizes
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 56,
  },

  // States
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },

  fullWidth: {
    width: "100%",
  },

  // Content
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },

  // Text styles
  text: {
    fontFamily: FONT_FAMILIES.inter.semibold,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  secondaryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.inter.bold,
  },
  ghostText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.inter.bold,
  },
  dangerText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  gradientText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.inter.bold,
  },

  // Size text styles
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.base,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },

  disabledText: {
    opacity: 0.8,
  },

  // Icons
  loader: {
    marginRight: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
});
