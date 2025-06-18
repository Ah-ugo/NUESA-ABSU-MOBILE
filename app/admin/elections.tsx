"use client";

import { API_BASE_URL, useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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

export default function AdminElections() {
  const { token } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    election_type: "faculty",
    department: "",
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/elections`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const createElection = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/elections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        }),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Election created successfully",
        });
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          election_type: "faculty",
          department: "",
        });
        await fetchElections();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const error = await response.json();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.detail || "Failed to create election",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your connection",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteElection = async (electionId: string, title: string) => {
    Alert.alert(
      "Delete Election",
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/admin/elections/${electionId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (response.ok) {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Election deleted successfully",
                });
                await fetchElections();
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Failed to delete election",
                });
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Network Error",
                text2: "Please check your connection",
              });
            }
          },
        },
      ]
    );
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
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "completed":
        return "#6c757d";
      default:
        return "#667eea";
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Manage Elections</Text>
        <Text style={styles.headerSubtitle}>Create and manage elections</Text>
      </LinearGradient>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Election</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {elections.map((election) => (
          <View key={election.id} style={styles.electionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.electionTitle}>{election.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(election.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {election.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteElection(election.id, election.title)}
              >
                <Ionicons name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>

            {election.description && (
              <Text style={styles.description}>{election.description}</Text>
            )}

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Start: {formatDate(election.start_date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  End: {formatDate(election.end_date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="business" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Type:{" "}
                  {election.election_type === "faculty"
                    ? "Faculty"
                    : "Departmental"}
                </Text>
              </View>
              {election.department && (
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Department: {election.department}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Election Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Election</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Enter election title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Enter election description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Election Type *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, election_type: "faculty" })
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      formData.election_type === "faculty" &&
                        styles.radioSelected,
                    ]}
                  >
                    {formData.election_type === "faculty" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>Faculty Wide</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, election_type: "departmental" })
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      formData.election_type === "departmental" &&
                        styles.radioSelected,
                    ]}
                  >
                    {formData.election_type === "departmental" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>Departmental</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.election_type === "departmental" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.department}
                  onChangeText={(text) =>
                    setFormData({ ...formData, department: text })
                  }
                  placeholder="Enter department name"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.start_date}
                onChangeText={(text) =>
                  setFormData({ ...formData, start_date: text })
                }
                placeholder="YYYY-MM-DD HH:MM"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.end_date}
                onChangeText={(text) =>
                  setFormData({ ...formData, end_date: text })
                }
                placeholder="YYYY-MM-DD HH:MM"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isCreating && styles.submitButtonDisabled,
              ]}
              onPress={createElection}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Election</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  actionBar: {
    padding: 20,
    paddingBottom: 10,
  },
  createButton: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  electionCard: {
    backgroundColor: "white",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#667eea",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#667eea",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },
});
