"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
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
  created_at: string;
  updated_at: string;
  created_by: string;
}

export default function ElectionsScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [elections, setElections] = useState<Election[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "pending" | "completed"
  >("all");

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setElections(data);
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchElections();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "play-circle";
      case "pending":
        return "time";
      case "completed":
        return "checkmark-circle";
      default:
        return "help-circle";
    }
  };

  const getElectionTypeColor = (type: string) => {
    return type === "faculty" ? colors.primary : "#f093fb";
  };

  const getElectionTypeIcon = (type: string) => {
    return type === "faculty" ? "school" : "business";
  };

  const getFilteredElections = () => {
    if (selectedFilter === "all") return elections;
    return elections.filter((election) => election.status === selectedFilter);
  };

  const getElectionDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const isElectionActive = (election: Election) => {
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);
    return now >= start && now <= end;
  };

  const filters = [
    { key: "all", label: "All", count: elections.length },
    {
      key: "active",
      label: "Active",
      count: elections.filter((e) => e.status === "active").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: elections.filter((e) => e.status === "pending").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: elections.filter((e) => e.status === "completed").length,
    },
  ];

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Elections</Text>
        <Text style={styles.headerSubtitle}>
          View all NUESA elections and their status
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  { backgroundColor: colors.surface },
                  selectedFilter === filter.key && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.textSecondary },
                    selectedFilter === filter.key && { color: "white" },
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      { backgroundColor: colors.border },
                      selectedFilter === filter.key && {
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        { color: colors.textSecondary },
                        selectedFilter === filter.key && { color: "white" },
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Elections List */}
        {getFilteredElections().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={80} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Elections Found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedFilter === "all"
                ? "There are no elections available at the moment."
                : `There are no ${selectedFilter} elections.`}
            </Text>
          </View>
        ) : (
          getFilteredElections().map((election) => (
            <View
              key={election.id}
              style={[styles.electionCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.electionHeader}>
                <View style={styles.electionTitleContainer}>
                  <Text style={[styles.electionTitle, { color: colors.text }]}>
                    {election.title}
                  </Text>
                  <View style={styles.electionBadges}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(election.status) },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(election.status) as any}
                        size={12}
                        color="white"
                      />
                      <Text style={styles.statusText}>
                        {election.status.toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor: getElectionTypeColor(
                            election.election_type
                          ),
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          getElectionTypeIcon(election.election_type) as any
                        }
                        size={12}
                        color="white"
                      />
                      <Text style={styles.typeText}>
                        {election.election_type === "faculty"
                          ? "Faculty"
                          : "Departmental"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {election.description && (
                <Text
                  style={[
                    styles.electionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {election.description}
                </Text>
              )}

              <View style={styles.electionDetails}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                  >
                    Starts: {formatDate(election.start_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                  >
                    Ends: {formatDate(election.end_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                  >
                    Duration:{" "}
                    {getElectionDuration(
                      election.start_date,
                      election.end_date
                    )}
                  </Text>
                </View>
                {election.department && (
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Department: {election.department}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {election.status === "active" && (
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => router.push("/(tabs)/vote")}
                  >
                    <LinearGradient
                      colors={[colors.success, "#20c997"]}
                      style={styles.buttonGradient}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="white"
                      />
                      <Text style={styles.buttonText}>Vote Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.resultsButton}
                  onPress={() => router.push("/(tabs)/results")}
                >
                  <View
                    style={[
                      styles.outlineButton,
                      { borderColor: colors.primary },
                    ]}
                  >
                    <Ionicons
                      name="bar-chart"
                      size={16}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.outlineButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      View Results
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Live Indicator for Active Elections */}
              {isElectionActive(election) && (
                <View
                  style={[
                    styles.liveIndicator,
                    { backgroundColor: colors.error },
                  ]}
                >
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
          ))
        )}

        <View style={styles.bottomPadding} />
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
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "white",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
      textAlign: "center",
    },
    content: {
      flex: 1,
      padding: 20,
    },
    filterContainer: {
      marginBottom: 20,
    },
    filterTab: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 25,
      marginRight: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: "500",
    },
    filterBadge: {
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
      minWidth: 20,
      alignItems: "center",
    },
    filterBadgeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    electionCard: {
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
      position: "relative",
    },
    electionHeader: {
      marginBottom: 12,
    },
    electionTitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    electionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      flex: 1,
      marginRight: 12,
    },
    electionBadges: {
      gap: 6,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    typeBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    typeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    electionDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
    electionDetails: {
      gap: 8,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detailText: {
      fontSize: 14,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
    },
    voteButton: {
      flex: 1,
      borderRadius: 12,
      overflow: "hidden",
    },
    buttonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 6,
    },
    buttonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    resultsButton: {
      flex: 1,
    },
    outlineButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderRadius: 12,
      gap: 6,
    },
    outlineButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    liveIndicator: {
      position: "absolute",
      top: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "white",
    },
    liveText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    emptyContainer: {
      alignItems: "center",
      padding: 40,
      marginTop: 60,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
    },
    bottomPadding: {
      height: 40,
    },
  });
