"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL, useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface Election {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  election_type: string;
  department?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

export default function HomeScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [votingStatus, setVotingStatus] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchCurrentElection(),
      fetchAnnouncements(),
      fetchVotingStatus(),
    ]);
  };

  const fetchCurrentElection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/elections/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentElection(data);
      }
    } catch (error) {
      console.error("Error fetching current election:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/announcements`);

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.slice(0, 3)); // Show only first 3
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const fetchVotingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/votes/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVotingStatus(data);
      }
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getElectionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.success;
      case "pending":
        return colors.warning;
      case "completed":
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.error;
      case "medium":
        return colors.warning;
      case "low":
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.userDept}>
                  {user?.department} • {user?.level}l
                </Text>
              </View>
            </View>
            {user?.is_admin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color="white" />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Current Election Card */}
          {currentElection && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="list" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Current Election
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getElectionStatusColor(
                        currentElection.status
                      ),
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {currentElection.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.electionTitle, { color: colors.text }]}>
                {currentElection.title}
              </Text>
              {currentElection.description && (
                <Text
                  style={[
                    styles.electionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {currentElection.description}
                </Text>
              )}
              <View style={styles.electionDetails}>
                <View style={styles.electionDetailItem}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.electionDetailText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatDate(currentElection.start_date)} -{" "}
                    {formatDate(currentElection.end_date)}
                  </Text>
                </View>
                <View style={styles.electionDetailItem}>
                  <Ionicons
                    name="business"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.electionDetailText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {currentElection.election_type === "faculty"
                      ? "Faculty Wide"
                      : currentElection.department}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Voting Status Card */}
          {votingStatus && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Your Voting Status
                </Text>
              </View>
              <View style={styles.votingStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {votingStatus.total_votes}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Votes Cast
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {votingStatus.voted_positions?.length || 0}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Positions Voted
                  </Text>
                </View>
              </View>
              {votingStatus.voted_positions &&
                votingStatus.voted_positions.length > 0 && (
                  <View style={styles.votedPositions}>
                    <Text
                      style={[
                        styles.votedPositionsTitle,
                        { color: colors.text },
                      ]}
                    >
                      Positions you've voted for:
                    </Text>
                    {votingStatus.voted_positions.map(
                      (position: string, index: number) => (
                        <View
                          key={index}
                          style={[
                            styles.positionTag,
                            { backgroundColor: `${colors.info}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.positionTagText,
                              { color: colors.info },
                            ]}
                          >
                            {position}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/vote")}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </LinearGradient>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Vote Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/results")}
              >
                <LinearGradient
                  colors={["#f093fb", "#f5576c"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="bar-chart" size={24} color="white" />
                </LinearGradient>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  View Results
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/elections")}
              >
                <LinearGradient
                  colors={["#4facfe", "#00f2fe"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="people" size={24} color="white" />
                </LinearGradient>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Elections
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Announcements */}
          {announcements.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="megaphone" size={24} color={colors.warning} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Latest Announcements
                </Text>
              </View>
              {announcements.map((announcement) => (
                <View key={announcement.id} style={styles.announcementItem}>
                  <View style={styles.announcementHeader}>
                    <Text
                      style={[styles.announcementTitle, { color: colors.text }]}
                    >
                      {announcement.title}
                    </Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: getPriorityColor(
                            announcement.priority
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {announcement.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.announcementContent,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {announcement.content}
                  </Text>
                  <Text
                    style={[
                      styles.announcementDate,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatDate(announcement.created_at)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      marginRight: 15,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 3,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    avatarPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    avatarText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    },
    userDetails: {
      flex: 1,
    },
    welcomeText: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: 14,
    },
    userName: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
      marginVertical: 2,
    },
    userDept: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: 14,
    },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    adminText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    content: {
      padding: 20,
      paddingTop: 0,
    },
    card: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 10,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    electionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
    },
    electionDescription: {
      fontSize: 14,
      marginBottom: 15,
      lineHeight: 20,
    },
    electionDetails: {
      gap: 8,
    },
    electionDetailItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    electionDetailText: {
      fontSize: 14,
      marginLeft: 8,
    },
    votingStats: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 15,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 32,
      fontWeight: "bold",
    },
    statLabel: {
      fontSize: 14,
      marginTop: 4,
    },
    votedPositions: {
      marginTop: 10,
    },
    votedPositionsTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    positionTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      alignSelf: "flex-start",
    },
    positionTagText: {
      fontSize: 12,
      fontWeight: "500",
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    actionButton: {
      alignItems: "center",
      flex: 1,
      marginHorizontal: 5,
    },
    actionGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    actionText: {
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
    },
    announcementItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 15,
      marginBottom: 15,
    },
    announcementHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    announcementTitle: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
      marginRight: 10,
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    priorityText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    announcementContent: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    announcementDate: {
      fontSize: 12,
    },
  });
