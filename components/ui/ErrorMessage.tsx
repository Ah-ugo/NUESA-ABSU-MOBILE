import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_FAMILIES } from '../../utils/constants';

interface ErrorMessageProps {
  message: string;
  style?: ViewStyle;
  showIcon?: boolean;
  variant?: 'default' | 'inline' | 'banner';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  style,
  showIcon = true,
  variant = 'default',
}) => {
  return (
    <View style={[styles.container, styles[variant], style]}>
      {showIcon && (
        <AlertTriangle size={20} color={COLORS.error} style={styles.icon} />
      )}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
  },
  default: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  inline: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin: 0,
    padding: SPACING.xs,
  },
  banner: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
    borderRadius: 0,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.inter.regular,
    color: COLORS.error,
    lineHeight: 20,
  },
});