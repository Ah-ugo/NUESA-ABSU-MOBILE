"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useAuth, API_BASE_URL } from "../../contexts/AuthContext"
import * as ImagePicker from "expo-image-picker"
import * as Haptics from "expo-haptics"

interface Department {
  id: string
  name: string
  faculty?: string
}

interface Level {
  id: string
  name: string
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricNumber: "",
    password: "",
    confirmPassword: "",
    department: "",
    level: "",
  })
  const [profileImage, setProfileImage] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [showDepartments, setShowDepartments] = useState(false)
  const [showLevels, setShowLevels] = useState(false)
  const { register } = useAuth()

  useEffect(() => {
    fetchDepartmentsAndLevels()
  }, [])

  const fetchDepartmentsAndLevels = async () => {
    try {
      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/api/v1/departments`)
      if (deptResponse.ok) {
        const deptData = await deptResponse.json()
        setDepartments(deptData)
      }

      // Fetch levels
      const levelResponse = await fetch(`${API_BASE_URL}/api/v1/levels`)
      if (levelResponse.ok) {
        const levelData = await levelResponse.json()
        setLevels(levelData)
      }
    } catch (error) {
      console.error("Error fetching departments and levels:", error)
      // Fallback to mock data if API fails
      setDepartments([
        { id: "1", name: "Computer Engineering", faculty: "Engineering" },
        { id: "2", name: "Electrical Engineering", faculty: "Engineering" },
        { id: "3", name: "Mechanical Engineering", faculty: "Engineering" },
        { id: "4", name: "Civil Engineering", faculty: "Engineering" },
        { id: "5", name: "Chemical Engineering", faculty: "Engineering" },
      ])

      setLevels([
        { id: "1", name: "100 Level" },
        { id: "2", name: "200 Level" },
        { id: "3", name: "300 Level" },
        { id: "4", name: "400 Level" },
        { id: "5", name: "500 Level" },
      ])
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0])
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    setIsLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const registrationData = {
      ...formData,
      matricNumber: formData.matricNumber.toUpperCase(),
    }

    if (profileImage) {
      registrationData.profileImage = {
        uri: profileImage.uri,
        type: "image/jpeg",
        name: "profile.jpg",
      }
    }

    const success = await register(registrationData)

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace("/(auth)/login")
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    setIsLoading(false)
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Last name is required")
      return false
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      Alert.alert("Error", "Valid email is required")
      return false
    }
    if (!formData.matricNumber.trim()) {
      Alert.alert("Error", "Matric number is required")
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return false
    }
    if (!formData.department) {
      Alert.alert("Error", "Department is required")
      return false
    }
    if (!formData.level) {
      Alert.alert("Error", "Level is required")
      return false
    }
    return true
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join NUESA Voting System</Text>
          </View>

          <View style={styles.form}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={30} color="#666" />
                  <Text style={styles.imageText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData("firstName", value)}
                  placeholderTextColor="#666"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData("lastName", value)}
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="school-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Matric Number"
                value={formData.matricNumber}
                onChangeText={(value) => updateFormData("matricNumber", value)}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDepartments(!showDepartments)}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={[styles.input, styles.selectText, !formData.department && styles.placeholder]}>
                {formData.department || "Select Department"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showDepartments && (
              <View style={styles.dropdown}>
                {departments.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateFormData("department", dept.name)
                      setShowDepartments(false)
                    }}
                  >
                    <Text style={styles.dropdownText}>{dept.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowLevels(!showLevels)}>
              <Ionicons name="library-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={[styles.input, styles.selectText, !formData.level && styles.placeholder]}>
                {formData.level || "Select Level"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showLevels && (
              <View style={styles.dropdown}>
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateFormData("level", level.name)
                      setShowLevels(false)
                    }}
                  >
                    <Text style={styles.dropdownText}>{level.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => updateFormData("password", value)}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData("confirmPassword", value)}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  form: {
    backgroundColor: "white",
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
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  imageText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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
    backgroundColor: "#f8f9fa",
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
    color: "#333",
  },
  selectText: {
    paddingVertical: 18,
  },
  placeholder: {
    color: "#666",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  dropdown: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
})
