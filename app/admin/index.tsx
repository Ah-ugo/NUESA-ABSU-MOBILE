"use client";

import { API_BASE_URL, useAuth } from "@/contexts/AuthContext";
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

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch elections
      const electionsResponse = await fetch(
        `${API_BASE_URL}/api/v1/elections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (electionsResponse.ok) {
        const elections = await electionsResponse.json();
        setStats((prev) => ({
          ...prev,
          totalElections: elections.length,
          activeElections: elections.filter((e: any) => e.status === "active")
            .length,
        }));
      }

      // Fetch candidates
      const candidatesResponse = await fetch(
        `${API_BASE_URL}/api/v1/candidates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (candidatesResponse.ok) {
        const candidates = await candidatesResponse.json();
        setStats((prev) => ({
          ...prev,
          totalCandidates: candidates.length,
          totalVotes: candidates.reduce(
            (sum: number, c: any) => sum + c.vote_count,
            0
          ),
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const adminMenuItems = [
    {
      title: "Manage Elections",
      subtitle: "Create, edit, and manage elections",
      icon: "list",
      color: ["#667eea", "#764ba2"],
      route: "/admin/elections",
    },
    {
      title: "Manage Candidates",
      subtitle: "Add and manage election candidates",
      icon: "people",
      color: ["#f093fb", "#f5576c"],
      route: "/admin/candidates",
    },
    {
      title: "Announcements",
      subtitle: "Create and manage announcements",
      icon: "megaphone",
      color: ["#4facfe", "#00f2fe"],
      route: "/admin/announcements",
    },
    {
      title: "User Management",
      subtitle: "View and manage registered users",
      icon: "person-circle",
      color: ["#43e97b", "#38f9d7"],
      route: "/admin/users",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage NUESA voting system</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="list" size={32} color="#667eea" />
            <Text style={styles.statNumber}>{stats.totalElections}</Text>
            <Text style={styles.statLabel}>Total Elections</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="play-circle" size={32} color="#28a745" />
            <Text style={styles.statNumber}>{stats.activeElections}</Text>
            <Text style={styles.statLabel}>Active Elections</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#f093fb" />
            <Text style={styles.statNumber}>{stats.totalCandidates}</Text>
            <Text style={styles.statLabel}>Total Candidates</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4facfe" />
            <Text style={styles.statNumber}>{stats.totalVotes}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.menuContainer}>
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => router.push(item.route as any)}
            >
              <LinearGradient colors={item.color} style={styles.menuGradient}>
                <View style={styles.menuContent}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon as any} size={32} color="white" />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: (width - 60) / 2,
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
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  menuContainer: {
    gap: 16,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  menuGradient: {
    padding: 20,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  bottomPadding: {
    height: 40,
  },
});
