import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "../../utils/constants";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  padding?: "none" | "small" | "medium" | "large";
}

// Map padding prop to style keys
const paddingStyles: Record<string, keyof typeof styles> = {
  none: "paddingNone",
  small: "paddingSmall",
  medium: "paddingMedium",
  large: "paddingLarge",
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  padding = "medium",
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[paddingStyles[padding]],
    style,
  ];

  if (variant === "gradient") {
    return (
      <View style={[styles.base, styles.gradientContainer, style]}>
        <LinearGradient
          colors={["rgba(37, 99, 235, 0.05)", "rgba(59, 130, 246, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[paddingStyles[padding]]]}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
  },

  // Variants
  default: {
    ...SHADOWS.medium,
  },
  elevated: {
    ...SHADOWS.large,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  gradient: {
    backgroundColor: "transparent",
  },

  // Gradient specific
  gradientContainer: {
    backgroundColor: "transparent",
    ...SHADOWS.medium,
  },

  // Padding variants
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: SPACING.sm,
  },
  paddingMedium: {
    padding: SPACING.md,
  },
  paddingLarge: {
    padding: SPACING.lg,
  },
});
