"use client";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/(tabs)/profile/edit");
      },
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => {
            setNotificationsEnabled(value);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={notificationsEnabled ? "white" : "#f4f3f4"}
        />
      ),
    },
    {
      icon: "moon-outline",
      title: "Dark Mode",
      subtitle: "Toggle dark theme",
      rightComponent: (
        <Switch
          value={isDark}
          onValueChange={() => {
            toggleTheme();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={isDark ? "white" : "#f4f3f4"}
        />
      ),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowHelpModal(true);
      },
    },
    {
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
          "NUESA Voting App",
          "Version 1.0.0\n\nDeveloped for Nigerian University Engineering Students Association (NUESA) - Abia State University",
          [{ text: "OK" }]
        );
      },
    },
  ];

  const helpItems = [
    {
      icon: "help-circle",
      title: "How to Vote",
      description: "Learn how to cast your vote in elections",
      content:
        "1. Navigate to the Vote tab\n2. Select an active election\n3. Choose your preferred candidates\n4. Submit your votes\n\nNote: You can only vote once per position in each election.",
    },
    {
      icon: "people",
      title: "Candidate Information",
      description: "View candidate profiles and manifestos",
      content:
        "Tap on any candidate card to view their full profile, including:\n• Full manifesto\n• Academic level\n• Department\n• Photo\n\nMake informed decisions by reading candidate manifestos carefully.",
    },
    {
      icon: "bar-chart",
      title: "Election Results",
      description: "Understanding election results and statistics",
      content:
        "Results are displayed in real-time showing:\n• Vote counts for each candidate\n• Percentage of total votes\n• Winner announcements\n• Position-wise breakdowns\n\nResults are updated automatically as votes are counted.",
    },
    {
      icon: "shield-checkmark",
      title: "Account Security",
      description: "Keep your account safe and secure",
      content:
        "Security tips:\n• Use a strong, unique password\n• Don't share your login credentials\n• Log out from shared devices\n• Report suspicious activity\n\nYour vote is anonymous and secure.",
    },
    {
      icon: "mail",
      title: "Contact Support",
      description: "Get in touch with our support team",
      content:
        "Need help? Contact us:\n\nEmail: support@nuesa-absu.edu.ng\nPhone: +234 XXX XXX XXXX\nOffice: NUESA Office, ABSU\n\nSupport hours: Mon-Fri, 9AM-5PM",
    },
  ];

  const [selectedHelpItem, setSelectedHelpItem] = useState<any>(null);

  const styles = createStyles(colors, isDark);

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Text>
                </View>
              )}
              {user.is_admin && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userMatric}>{user.matricNumber}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* User Info Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Student Information
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <View style={styles.infoText}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Department
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {user.department}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="library" size={20} color={colors.primary} />
                <View style={styles.infoText}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Level
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {user.level}l
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <View style={styles.infoText}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Member Since
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatDate(user.created_at)}
                  </Text>
                </View>
              </View>
              {user.is_admin && (
                <View style={styles.infoItem}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={colors.success}
                  />
                  <View style={styles.infoText}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Role
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.success }]}>
                      Administrator
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Menu Items */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Settings
            </Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                  { borderBottomColor: colors.border },
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text
                      style={[styles.menuItemTitle, { color: colors.text }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.menuItemSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                {item.rightComponent || (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin Panel Access */}
          {user.is_admin && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Administrator
              </Text>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push("/admin")}
              >
                <LinearGradient
                  colors={[colors.success, "#20c997"]}
                  style={styles.adminGradient}
                >
                  <Ionicons name="settings" size={20} color="white" />
                  <Text style={styles.adminButtonText}>Admin Panel</Text>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.surface,
                borderColor: `${colors.error}20`,
              },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Help & Support
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedHelpItem ? (
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity
                style={styles.backToList}
                onPress={() => setSelectedHelpItem(null)}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text
                  style={[styles.backToListText, { color: colors.primary }]}
                >
                  Back to Help Topics
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.helpDetailCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.helpDetailHeader}>
                  <View
                    style={[
                      styles.helpDetailIcon,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Ionicons
                      name={selectedHelpItem.icon}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.helpDetailTitle, { color: colors.text }]}
                  >
                    {selectedHelpItem.title}
                  </Text>
                </View>
                <Text
                  style={[styles.helpDetailContent, { color: colors.text }]}
                >
                  {selectedHelpItem.content}
                </Text>
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.helpIntro, { color: colors.textSecondary }]}>
                Find answers to common questions and get help with using the
                NUESA Voting app.
              </Text>

              {helpItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.helpItem, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedHelpItem(item)}
                >
                  <View
                    style={[
                      styles.helpIcon,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.helpText}>
                    <Text style={[styles.helpTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.helpDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}

              <View
                style={[
                  styles.contactCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.contactTitle, { color: colors.text }]}>
                  Still need help?
                </Text>
                <Text
                  style={[styles.contactText, { color: colors.textSecondary }]}
                >
                  Contact our support team for personalized assistance.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.contactButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="mail" size={16} color="white" />
                  <Text style={styles.contactButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
      paddingBottom: 40,
      alignItems: "center",
    },
    profileSection: {
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    avatarText: {
      color: "white",
      fontSize: 32,
      fontWeight: "bold",
    },
    adminBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#28a745",
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "white",
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
      marginBottom: 2,
    },
    userMatric: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.7)",
      fontWeight: "500",
    },
    content: {
      padding: 20,
      marginTop: -20,
    },
    card: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
    },
    infoGrid: {
      gap: 16,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoText: {
      marginLeft: 12,
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "500",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    menuItemText: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 2,
    },
    menuItemSubtitle: {
      fontSize: 12,
    },
    adminButton: {
      borderRadius: 12,
      overflow: "hidden",
    },
    adminGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    adminButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
      marginLeft: 12,
    },
    logoutButton: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
    },
    logoutContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    bottomPadding: {
      height: 40,
    },
    // Modal styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    helpIntro: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
      textAlign: "center",
    },
    helpItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    helpIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    helpText: {
      flex: 1,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    helpDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    contactCard: {
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
    },
    contactText: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 20,
    },
    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    contactButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    backToList: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 8,
    },
    backToListText: {
      fontSize: 16,
      fontWeight: "500",
    },
    helpDetailCard: {
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    helpDetailHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    helpDetailIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    helpDetailTitle: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
    },
    helpDetailContent: {
      fontSize: 16,
      lineHeight: 24,
    },
  });
