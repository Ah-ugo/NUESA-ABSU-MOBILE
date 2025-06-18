"use client";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { API_BASE_URL, useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";

interface Department {
  id: string;
  name: string;
  faculty?: string;
}

interface Level {
  id: string;
  name: string;
}

export default function EditProfileScreen() {
  const { user, token } = useAuth();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showDepartments, setShowDepartments] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    department: user?.department || "",
    level: user?.level || "",
  });

  useEffect(() => {
    fetchDepartmentsAndLevels();
  }, []);

  const fetchDepartmentsAndLevels = async () => {
    try {
      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/api/v1/departments`);
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }

      // Fetch levels
      const levelResponse = await fetch(`${API_BASE_URL}/api/v1/levels`);
      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        setLevels(levelData);
      }
    } catch (error) {
      console.error("Error fetching departments and levels:", error);
      // Fallback to mock data
      setDepartments([
        { id: "1", name: "Computer Engineering", faculty: "Engineering" },
        { id: "2", name: "Electrical Engineering", faculty: "Engineering" },
        { id: "3", name: "Mechanical Engineering", faculty: "Engineering" },
        { id: "4", name: "Civil Engineering", faculty: "Engineering" },
        { id: "5", name: "Chemical Engineering", faculty: "Engineering" },
      ]);

      setLevels([
        { id: "1", name: "100 Level" },
        { id: "2", name: "200 Level" },
        { id: "3", name: "300 Level" },
        { id: "4", name: "400 Level" },
        { id: "5", name: "500 Level" },
      ]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateProfile = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("level", formData.level);

      if (profileImage) {
        formDataToSend.append("profileImage", {
          uri: profileImage.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been updated successfully",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        const error = await response.json();
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: error.detail || "Failed to update profile",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      Alert.alert("Error", "Valid email is required");
      return false;
    }
    if (!formData.department) {
      Alert.alert("Error", "Department is required");
      return false;
    }
    if (!formData.level) {
      Alert.alert("Error", "Level is required");
      return false;
    }
    return true;
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.form, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  style={styles.profileImage}
                />
              ) : user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.row}>
              <View
                style={[
                  styles.inputContainer,
                  styles.halfWidth,
                  { backgroundColor: colors.background },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="First Name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData("firstName", value)}
                />
              </View>
              <View
                style={[
                  styles.inputContainer,
                  styles.halfWidth,
                  { backgroundColor: colors.background },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData("lastName", value)}
                />
              </View>
            </View>

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.inputContainer,
                { backgroundColor: colors.background },
              ]}
              onPress={() => setShowDepartments(!showDepartments)}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.input,
                  styles.selectText,
                  {
                    color: formData.department
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
              >
                {formData.department || "Select Department"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showDepartments && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                {departments.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => {
                      updateFormData("department", dept.name);
                      setShowDepartments(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {dept.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                { backgroundColor: colors.background },
              ]}
              onPress={() => setShowLevels(!showLevels)}
            >
              <Ionicons
                name="library-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.input,
                  styles.selectText,
                  {
                    color: formData.level ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {formData.level || "Select Level"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showLevels && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => {
                      updateFormData("level", level.name);
                      setShowLevels(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {level.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.updateButton,
                isLoading && styles.updateButtonDisabled,
              ]}
              onPress={updateProfile}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.updateGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.updateButtonText}>Update Profile</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
      marginTop: -10,
    },
    form: {
      borderRadius: 20,
      padding: 30,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    imageContainer: {
      alignSelf: "center",
      marginBottom: 30,
      position: "relative",
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#667eea",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "white",
      fontSize: 32,
      fontWeight: "bold",
    },
    cameraIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#667eea",
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "white",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    halfWidth: {
      width: "48%",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
    },
    selectText: {
      paddingVertical: 18,
    },
    dropdown: {
      borderRadius: 12,
      marginBottom: 16,
      maxHeight: 200,
      borderWidth: 1,
    },
    dropdownItem: {
      padding: 16,
      borderBottomWidth: 1,
    },
    dropdownText: {
      fontSize: 16,
    },
    updateButton: {
      borderRadius: 12,
      overflow: "hidden",
      marginTop: 20,
    },
    updateButtonDisabled: {
      opacity: 0.7,
    },
    updateGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 8,
    },
    updateButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    bottomPadding: {
      height: 40,
    },
  });
