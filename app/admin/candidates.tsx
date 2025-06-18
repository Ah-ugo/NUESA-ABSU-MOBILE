"use client";

import { API_BASE_URL, useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

interface Candidate {
  id: string;
  fullName: string;
  position: string;
  election_id: string;
  election_type: string;
  department?: string;
  level: string;
  manifesto: string;
  photo?: string;
  vote_count: number;
}

interface Election {
  id: string;
  title: string;
  status: string;
  election_type: string;
  department?: string;
}

export default function AdminCandidates() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    level: "",
    manifesto: "",
  });

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidatesForElection(selectedElection.id);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/elections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setElections(data);
        if (data.length > 0 && !selectedElection) {
          setSelectedElection(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const fetchCandidatesForElection = async (electionId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/candidates?election_id=${electionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Filter candidates to ensure they belong to the selected election
        const filteredCandidates = data.filter(
          (candidate: Candidate) => candidate.election_id === electionId
        );
        setCandidates(filteredCandidates);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchElections();
    if (selectedElection) {
      await fetchCandidatesForElection(selectedElection.id);
    }
    setIsRefreshing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const createCandidate = async () => {
    if (!selectedElection) {
      Toast.show({
        type: "error",
        text1: "No Election Selected",
        text2: "Please select an election first",
      });
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.position.trim() ||
      !formData.manifesto.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields",
      });
      return;
    }

    setIsCreating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("election_id", selectedElection.id);
      formDataToSend.append("election_type", selectedElection.election_type);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("manifesto", formData.manifesto);

      if (selectedElection.department) {
        formDataToSend.append("department", selectedElection.department);
      }

      if (selectedImage) {
        formDataToSend.append("photo", {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: "candidate.jpg",
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/candidates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Candidate created successfully for ${selectedElection.title}`,
        });
        setShowCreateModal(false);
        resetForm();
        await fetchCandidatesForElection(selectedElection.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const error = await response.json();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.detail || "Failed to create candidate",
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

  const resetForm = () => {
    setFormData({
      fullName: "",
      position: "",
      level: "",
      manifesto: "",
    });
    setSelectedImage(null);
  };

  const groupCandidatesByPosition = () => {
    const grouped: { [key: string]: Candidate[] } = {};
    candidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });
    return grouped;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Manage Candidates</Text>
        <Text style={styles.headerSubtitle}>
          Add and manage election candidates
        </Text>
      </LinearGradient>

      {/* Election Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Select Election:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {elections.map((election) => (
            <TouchableOpacity
              key={election.id}
              style={[
                styles.electionTab,
                selectedElection?.id === election.id &&
                  styles.electionTabActive,
              ]}
              onPress={() => setSelectedElection(election)}
            >
              <Text
                style={[
                  styles.electionTabText,
                  selectedElection?.id === election.id &&
                    styles.electionTabTextActive,
                ]}
              >
                {election.title}
              </Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      election.status === "active" ? "#28a745" : "#6c757d",
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.createButton,
            !selectedElection && styles.createButtonDisabled,
          ]}
          onPress={() => setShowCreateModal(true)}
          disabled={!selectedElection}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>
            Add Candidate{" "}
            {selectedElection ? `to ${selectedElection.title}` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {selectedElection ? (
          candidates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Candidates</Text>
              <Text style={styles.emptyText}>
                No candidates found for "{selectedElection.title}". Add the
                first candidate to get started.
              </Text>
            </View>
          ) : (
            Object.entries(groupCandidatesByPosition()).map(
              ([position, positionCandidates]) => (
                <View key={position} style={styles.positionSection}>
                  <View style={styles.positionHeader}>
                    <Text style={styles.positionTitle}>{position}</Text>
                    <Text style={styles.candidateCount}>
                      {positionCandidates.length} candidate(s)
                    </Text>
                  </View>
                  {positionCandidates.map((candidate) => (
                    <View key={candidate.id} style={styles.candidateCard}>
                      <View style={styles.candidateInfo}>
                        <View style={styles.candidateImageContainer}>
                          {candidate.photo ? (
                            <Image
                              source={{ uri: candidate.photo }}
                              style={styles.candidateImage}
                            />
                          ) : (
                            <View style={styles.candidateImagePlaceholder}>
                              <Text style={styles.candidateInitials}>
                                {candidate.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.candidateDetails}>
                          <Text style={styles.candidateName}>
                            {candidate.fullName}
                          </Text>
                          <Text style={styles.candidateLevel}>
                            {candidate.level}
                          </Text>
                          <Text style={styles.candidateVotes}>
                            {candidate.vote_count} votes
                          </Text>
                          <Text
                            style={styles.candidateManifesto}
                            numberOfLines={2}
                          >
                            {candidate.manifesto}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )
            )
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Select an Election</Text>
            <Text style={styles.emptyText}>
              Please select an election above to view and manage its candidates.
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Candidate Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add Candidate{" "}
              {selectedElection ? `to ${selectedElection.title}` : ""}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#666" />
                  <Text style={styles.imageText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="Enter candidate's full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Position *</Text>
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={(text) =>
                  setFormData({ ...formData, position: text })
                }
                placeholder="e.g., President, Vice President"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Level *</Text>
              <TextInput
                style={styles.input}
                value={formData.level}
                onChangeText={(text) =>
                  setFormData({ ...formData, level: text })
                }
                placeholder="e.g., 300 Level, 400 Level"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Manifesto *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.manifesto}
                onChangeText={(text) =>
                  setFormData({ ...formData, manifesto: text })
                }
                placeholder="Enter candidate's manifesto"
                multiline
                numberOfLines={4}
              />
            </View>

            {selectedElection && (
              <View style={styles.electionInfo}>
                <Text style={styles.electionInfoLabel}>Election:</Text>
                <Text style={styles.electionInfoText}>
                  {selectedElection.title}
                </Text>
                <Text style={styles.electionInfoType}>
                  {selectedElection.election_type === "faculty"
                    ? "Faculty Wide"
                    : selectedElection.department}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isCreating && styles.submitButtonDisabled,
              ]}
              onPress={createCandidate}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Add Candidate</Text>
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
  selectorContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  electionTab: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  electionTabActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  electionTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginRight: 8,
  },
  electionTabTextActive: {
    color: "white",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
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
  createButtonDisabled: {
    backgroundColor: "#ccc",
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
  positionSection: {
    marginBottom: 24,
    marginTop: 20,
  },
  positionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  candidateCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  candidateCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  candidateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  candidateImageContainer: {
    marginRight: 16,
  },
  candidateImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  candidateImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  candidateInitials: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  candidateLevel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  candidateVotes: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "600",
    marginBottom: 6,
  },
  candidateManifesto: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  imageText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
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
    height: 100,
    textAlignVertical: "top",
  },
  electionInfo: {
    backgroundColor: "#f8f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#667eea",
  },
  electionInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
    marginBottom: 4,
  },
  electionInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  electionInfoType: {
    fontSize: 14,
    color: "#666",
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
