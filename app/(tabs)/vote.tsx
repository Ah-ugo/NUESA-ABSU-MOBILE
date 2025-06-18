"use client";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { API_BASE_URL, useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

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

interface VotingStatus {
  total_votes: number;
  voted_positions?: string[];
  elections?: {
    [electionId: string]: {
      voted_positions: string[];
      votes: Array<{
        position: string;
        candidate_name: string;
        voted_at: string;
      }>;
    };
  };
}

export default function VoteScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<{
    [key: string]: string;
  }>({});
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchElections(), fetchVotingStatus()]);
  };

  const fetchElections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const activeElections = data.filter(
          (election: Election) => election.status === "active"
        );
        setElections(activeElections);

        if (activeElections.length > 0 && !selectedElection) {
          setSelectedElection(activeElections[0]);
          await fetchCandidatesForElection(activeElections[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const fetchCandidatesForElection = async (electionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/candidates?election_id=${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter candidates by election ID to ensure we only get candidates for this specific election
        const filteredCandidates = data.filter(
          (candidate: Candidate) => candidate.election_id === electionId
        );
        setCandidates(filteredCandidates);

        // Get unique positions for this specific election
        const uniquePositions = [
          ...new Set(
            filteredCandidates.map((candidate: Candidate) => candidate.position)
          ),
        ];
        setPositions(uniquePositions);

        // Clear selected candidates when switching elections
        setSelectedCandidates({});
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
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
    if (selectedElection) {
      await fetchCandidatesForElection(selectedElection.id);
    }
    setIsRefreshing(false);
  };

  const selectCandidate = (position: string, candidateId: string) => {
    // Check if user has already voted for this position in this election
    if (isPositionVoted(position)) {
      Toast.show({
        type: "error",
        text1: "Already Voted",
        text2: `You have already voted for ${position} in this election`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: candidateId,
    }));
  };

  const submitVotes = async () => {
    if (!selectedElection) {
      Toast.show({
        type: "error",
        text1: "No Election Selected",
        text2: "Please select an election first",
      });
      return;
    }

    const votesToSubmit = Object.entries(selectedCandidates).map(
      ([position, candidateId]) => {
        return {
          candidate_id: candidateId,
          position: position,
          election_id: selectedElection.id,
          election_type: selectedElection.election_type,
          department: selectedElection.department || null,
        };
      }
    );

    if (votesToSubmit.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Votes Selected",
        text2: "Please select at least one candidate to vote for",
      });
      return;
    }

    Alert.alert(
      "Confirm Votes",
      `Are you sure you want to submit ${votesToSubmit.length} vote(s) for "${selectedElection.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: confirmSubmitVotes },
      ]
    );
  };

  const confirmSubmitVotes = async () => {
    try {
      setIsVoting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const votesToSubmit = Object.entries(selectedCandidates).map(
        ([position, candidateId]) => {
          return {
            candidate_id: candidateId,
            position: position,
            election_id: selectedElection!.id,
            election_type: selectedElection!.election_type,
            department: selectedElection!.department || null,
          };
        }
      );

      const response = await fetch(`${API_BASE_URL}/api/v1/votes/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votes: votesToSubmit }),
      });

      const data = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Votes Submitted!",
          text2: `Successfully submitted ${data.successful} vote(s) for ${
            selectedElection!.title
          }`,
        });

        // Clear selected candidates and refresh data
        setSelectedCandidates({});
        await fetchVotingStatus();
      } else {
        throw new Error(data.detail || "Failed to submit votes");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Voting Failed",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getCandidatesForPosition = (position: string) => {
    // Only return candidates for the selected election and position
    return candidates.filter(
      (candidate) =>
        candidate.position === position &&
        candidate.election_id === selectedElection?.id
    );
  };

  const isPositionVoted = (position: string) => {
    if (!selectedElection || !votingStatus) return false;

    // Check election-specific voting status first
    const electionVotingStatus = votingStatus.elections?.[selectedElection.id];
    if (electionVotingStatus?.voted_positions?.includes(position)) {
      return true;
    }

    // Fallback to general voted_positions if available
    return votingStatus.voted_positions?.includes(position) || false;
  };

  const getVotedCandidate = (position: string) => {
    // Get the candidate that was voted for in this position
    if (!selectedElection || !votingStatus) return null;
    const electionVotingStatus = votingStatus.elections?.[selectedElection.id];
    const vote = electionVotingStatus?.votes?.find(
      (v) => v.position === position
    );
    return vote ? vote.candidate_name : null;
  };

  const getVotedTime = (position: string) => {
    // Get when the vote was cast for this position
    if (!selectedElection || !votingStatus) return null;
    const electionVotingStatus = votingStatus.elections?.[selectedElection.id];
    const vote = electionVotingStatus?.votes?.find(
      (v) => v.position === position
    );
    return vote ? new Date(vote.voted_at).toLocaleString() : null;
  };

  const getAvailablePositions = () => {
    return positions.filter((position) => !isPositionVoted(position));
  };

  const getVotedPositions = () => {
    return positions.filter((position) => isPositionVoted(position));
  };

  const styles = createStyles(colors);

  if (elections.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="list-outline" size={80} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Active Elections
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          There are currently no active elections available for voting.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Cast Your Vote</Text>
        <Text style={styles.headerSubtitle}>
          Make your voice heard in NUESA elections
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Election Selector */}
        {elections.length > 1 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Election
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {elections.map((election) => (
                <TouchableOpacity
                  key={election.id}
                  style={[
                    styles.electionTab,
                    { backgroundColor: colors.background },
                    selectedElection?.id === election.id && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setSelectedElection(election);
                    fetchCandidatesForElection(election.id);
                  }}
                >
                  <Text
                    style={[
                      styles.electionTabText,
                      { color: colors.textSecondary },
                      selectedElection?.id === election.id && {
                        color: "white",
                      },
                    ]}
                  >
                    {election.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Current Election Info */}
        {selectedElection && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.electionInfo}>
              <Ionicons name="list-circle" size={24} color={colors.primary} />
              <View style={styles.electionDetails}>
                <Text style={[styles.electionTitle, { color: colors.text }]}>
                  {selectedElection.title}
                </Text>
                <Text
                  style={[styles.electionType, { color: colors.textSecondary }]}
                >
                  {selectedElection.election_type === "faculty"
                    ? "Faculty Wide"
                    : selectedElection.department}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Voting Progress */}
        {selectedElection && positions.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Voting Progress
              </Text>
              <View style={styles.progressStats}>
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {Object.keys(selectedCandidates).length} selected
                </Text>
                <Text
                  style={[
                    styles.progressDivider,
                    { color: colors.textSecondary },
                  ]}
                >
                  •
                </Text>
                <Text style={[styles.progressText, { color: colors.success }]}>
                  {getVotedPositions().length} voted
                </Text>
                <Text
                  style={[
                    styles.progressDivider,
                    { color: colors.textSecondary },
                  ]}
                >
                  •
                </Text>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {positions.length} total
                </Text>
              </View>
            </View>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFillVoted,
                  {
                    width: `${
                      (getVotedPositions().length / positions.length) * 100
                    }%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressFillSelected,
                  {
                    width: `${
                      (Object.keys(selectedCandidates).length /
                        positions.length) *
                      100
                    }%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textSecondary }]}
                >
                  Already Voted
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textSecondary }]}
                >
                  Selected
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Already Voted Positions */}
        {getVotedPositions().length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.votedHeader}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.success}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginBottom: 0, marginLeft: 12 },
                ]}
              >
                Already Voted ({getVotedPositions().length})
              </Text>
            </View>
            {getVotedPositions().map((position) => (
              <View
                key={position}
                style={[
                  styles.votedPositionCard,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.votedPositionHeader}>
                  <Text
                    style={[styles.votedPositionTitle, { color: colors.text }]}
                  >
                    {position}
                  </Text>
                  <View
                    style={[
                      styles.votedBadge,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <Ionicons name="checkmark" size={12} color="white" />
                    <Text style={styles.votedBadgeText}>VOTED</Text>
                  </View>
                </View>
                <View style={styles.votedDetails}>
                  <Text
                    style={[styles.votedCandidate, { color: colors.primary }]}
                  >
                    ✓ {getVotedCandidate(position)}
                  </Text>
                  <Text
                    style={[styles.votedTime, { color: colors.textSecondary }]}
                  >
                    Voted on {getVotedTime(position)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Available Positions to Vote */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading candidates...
            </Text>
          </View>
        ) : getAvailablePositions().length > 0 ? (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.availableHeader}>
                <Ionicons name="ballot" size={24} color={colors.primary} />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text, marginBottom: 0, marginLeft: 12 },
                  ]}
                >
                  Available to Vote ({getAvailablePositions().length})
                </Text>
              </View>
            </View>

            {getAvailablePositions().map((position) => (
              <View
                key={position}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.positionHeader}>
                  <Text style={[styles.positionTitle, { color: colors.text }]}>
                    {position}
                  </Text>
                  <View
                    style={[
                      styles.availableBadge,
                      { backgroundColor: colors.info },
                    ]}
                  >
                    <Ionicons name="time" size={12} color="white" />
                    <Text style={styles.availableBadgeText}>AVAILABLE</Text>
                  </View>
                </View>

                {getCandidatesForPosition(position).map((candidate) => (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[
                      styles.candidateCard,
                      { borderColor: colors.border },
                      selectedCandidates[position] === candidate.id && {
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                      },
                    ]}
                    onPress={() => selectCandidate(position, candidate.id)}
                  >
                    <View style={styles.candidateInfo}>
                      <View style={styles.candidateImageContainer}>
                        {candidate.photo ? (
                          <Image
                            source={{ uri: candidate.photo }}
                            style={styles.candidateImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.candidateImagePlaceholder,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Text style={styles.candidateInitials}>
                              {candidate.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        {selectedCandidates[position] === candidate.id && (
                          <View
                            style={[
                              styles.selectedOverlay,
                              { backgroundColor: colors.surface },
                            ]}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color={colors.primary}
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.candidateDetails}>
                        <Text
                          style={[styles.candidateName, { color: colors.text }]}
                        >
                          {candidate.fullName}
                        </Text>
                        <Text
                          style={[
                            styles.candidateLevel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {candidate.level}
                        </Text>
                        <Text
                          style={[
                            styles.candidateManifesto,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {candidate.manifesto}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioButton,
                          { borderColor: colors.border },
                          selectedCandidates[position] === candidate.id && {
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        {selectedCandidates[position] === candidate.id && (
                          <View
                            style={[
                              styles.radioButtonInner,
                              { backgroundColor: colors.primary },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        ) : (
          !isLoading &&
          positions.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.allVotedContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={colors.success}
                />
                <Text style={[styles.allVotedTitle, { color: colors.text }]}>
                  All Votes Cast!
                </Text>
                <Text
                  style={[styles.allVotedText, { color: colors.textSecondary }]}
                >
                  You have successfully voted for all positions in this
                  election.
                </Text>
              </View>
            </View>
          )
        )}

        {/* Submit Button */}
        {Object.keys(selectedCandidates).length > 0 && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isVoting && styles.submitButtonDisabled,
            ]}
            onPress={submitVotes}
            disabled={isVoting}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.submitGradient}
            >
              {isVoting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.submitButtonText}>
                    Submit {Object.keys(selectedCandidates).length} Vote(s)
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 15,
    },
    electionTab: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      marginRight: 12,
    },
    electionTabText: {
      fontSize: 14,
      fontWeight: "500",
    },
    electionInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    electionDetails: {
      marginLeft: 12,
      flex: 1,
    },
    electionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
    },
    electionType: {
      fontSize: 14,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    progressStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
    },
    progressDivider: {
      fontSize: 12,
      marginHorizontal: 8,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      position: "relative",
      marginBottom: 12,
    },
    progressFillVoted: {
      position: "absolute",
      height: "100%",
      borderRadius: 4,
      zIndex: 1,
    },
    progressFillSelected: {
      position: "absolute",
      height: "100%",
      borderRadius: 4,
      zIndex: 2,
      opacity: 0.7,
    },
    progressLegend: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 20,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
    },
    votedHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    availableHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    votedPositionCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.success + "30",
    },
    votedPositionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    votedPositionTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    votedBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    votedBadgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    availableBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    availableBadgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    votedDetails: {
      gap: 4,
    },
    votedCandidate: {
      fontSize: 14,
      fontWeight: "600",
    },
    votedTime: {
      fontSize: 12,
    },
    positionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    positionTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    candidateCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 12,
    },
    candidateInfo: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
    },
    candidateImageContainer: {
      position: "relative",
      marginRight: 15,
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
      justifyContent: "center",
      alignItems: "center",
    },
    candidateInitials: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    selectedOverlay: {
      position: "absolute",
      top: -5,
      right: -5,
      borderRadius: 12,
      padding: 2,
    },
    candidateDetails: {
      flex: 1,
    },
    candidateName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    candidateLevel: {
      fontSize: 14,
      marginBottom: 6,
    },
    candidateManifesto: {
      fontSize: 12,
      lineHeight: 16,
    },
    radioContainer: {
      marginLeft: 15,
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    allVotedContainer: {
      alignItems: "center",
      padding: 20,
    },
    allVotedTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
    },
    allVotedText: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
    },
    submitButton: {
      marginTop: 20,
      borderRadius: 16,
      overflow: "hidden",
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    submitButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 8,
    },
    loadingContainer: {
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      marginTop: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
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
