import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES } from '../../utils/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'gradient';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  fullScreen = false,
  variant = 'default',
}) => {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  if (variant === 'gradient' && fullScreen) {
    return (
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.1)', 'rgba(59, 130, 246, 0.1)']}
        style={styles.fullScreenContainer}
      >
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.inter.medium,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});