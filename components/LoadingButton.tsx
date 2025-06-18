import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native"

interface LoadingButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  style?: any
  textStyle?: any
}

export function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: LoadingButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? <ActivityIndicator color="white" /> : <Text style={[styles.text, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
})
