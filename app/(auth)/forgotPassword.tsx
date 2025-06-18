import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const source = require("../../assets/images/logo1.png");

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await fetch(
        "https://nuesa-absu-election.onrender.com/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMessage("Password reset link sent to your email");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Image
                source={source}
                style={{ width: 80, height: 80, resizeMode: "cover" }}
              />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              }}
            >
              NUESA Voting
            </Text>
            <Text style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.8)" }}>
              Reset your password
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
                borderRadius: 12,
                marginBottom: 16,
                paddingHorizontal: 16,
                height: 56,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: "#333" }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>

            {error ? (
              <Text
                style={{
                  color: "red",
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            ) : null}
            {message ? (
              <Text
                style={{
                  color: "green",
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
            ) : null}

            <TouchableOpacity
              style={{
                backgroundColor: "#667eea",
                borderRadius: 12,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 8,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                opacity: isLoading ? 0.7 : 1,
              }}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontSize: 18, fontWeight: "600" }}
                >
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
