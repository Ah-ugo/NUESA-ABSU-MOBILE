"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function ResultsScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [results, setResults] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [positions, setPositions] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

        if (data.length > 0 && !selectedElection) {
          setSelectedElection(data[0]);
          await fetchResultsForElection(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const fetchResultsForElection = async (electionId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/results?election_id=${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter results to ensure they belong to the selected election
        const filteredResults = data.filter(
          (candidate: Candidate) => candidate.election_id === electionId
        );
        setResults(filteredResults);

        // Get unique positions for this specific election
        const uniquePositions = [
          ...new Set(
            filteredResults.map((candidate: Candidate) => candidate.position)
          ),
        ];
        setPositions(uniquePositions);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchElections();
    if (selectedElection) {
      await fetchResultsForElection(selectedElection.id);
    }
    setIsRefreshing(false);
  };

  const getCandidatesForPosition = (position: string) => {
    // Only return candidates for the selected election and position
    return results
      .filter(
        (candidate) =>
          candidate.position === position &&
          candidate.election_id === selectedElection?.id
      )
      .sort((a, b) => b.vote_count - a.vote_count);
  };

  const getTotalVotesForPosition = (position: string) => {
    return getCandidatesForPosition(position).reduce(
      (total, candidate) => total + candidate.vote_count,
      0
    );
  };

  const getVotePercentage = (candidate: Candidate) => {
    const totalVotes = getTotalVotesForPosition(candidate.position);
    return totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0;
  };

  const getPositionWinner = (position: string) => {
    const candidates = getCandidatesForPosition(position);
    return candidates.length > 0 ? candidates[0] : null;
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const styles = createStyles(colors);

  if (elections.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="analytics-outline" size={80} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Elections Found
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          There are no elections available to view results for.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Election Results</Text>
        <Text style={styles.headerSubtitle}>
          View voting outcomes and statistics
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Election Selector */}
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
                  fetchResultsForElection(election.id);
                }}
              >
                <Text
                  style={[
                    styles.electionTabText,
                    { color: colors.textSecondary },
                    selectedElection?.id === election.id && { color: "white" },
                  ]}
                >
                  {election.title}
                </Text>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor:
                        election.status === "active"
                          ? colors.success
                          : colors.textSecondary,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Current Election Info */}
        {selectedElection && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.electionInfo}>
              <Ionicons name="list" size={24} color={colors.primary} />
              <View style={styles.electionDetails}>
                <Text style={[styles.electionTitle, { color: colors.text }]}>
                  {selectedElection.title}
                </Text>
                <Text
                  style={[styles.electionType, { color: colors.textSecondary }]}
                >
                  {selectedElection.election_type === "faculty"
                    ? "Faculty Wide"
                    : selectedElection.department}{" "}
                  •{" "}
                  {selectedElection.status.charAt(0).toUpperCase() +
                    selectedElection.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Results Summary */}
        {selectedElection && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Results Summary
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                  {positions.length}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Positions
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                  {results.length}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Candidates
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                  {results.reduce(
                    (total, candidate) => total + candidate.vote_count,
                    0
                  )}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Total Votes
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Position Results */}
        {positions.map((position) => {
          const candidates = getCandidatesForPosition(position);
          const winner = getPositionWinner(position);
          const totalVotes = getTotalVotesForPosition(position);

          return (
            <View
              key={position}
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              <View style={styles.positionHeader}>
                <Text style={[styles.positionTitle, { color: colors.text }]}>
                  {position}
                </Text>
                <Text
                  style={[
                    styles.totalVotesText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {totalVotes} votes
                </Text>
              </View>

              {/* Winner Highlight */}
              {winner && (
                <View style={styles.winnerCard}>
                  <LinearGradient
                    colors={["#ffd700", "#ffed4e"]}
                    style={styles.winnerGradient}
                  >
                    <View style={styles.winnerContent}>
                      <View style={styles.winnerImageContainer}>
                        {winner.photo ? (
                          <Image
                            source={{ uri: winner.photo }}
                            style={styles.winnerImage}
                          />
                        ) : (
                          <View style={styles.winnerImagePlaceholder}>
                            <Text style={styles.winnerInitials}>
                              {winner.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        <View style={styles.crownIcon}>
                          <Ionicons name="trophy" size={20} color="#ffd700" />
                        </View>
                      </View>
                      <View style={styles.winnerDetails}>
                        <Text style={styles.winnerName}>{winner.fullName}</Text>
                        <Text style={styles.winnerVotes}>
                          {winner.vote_count} votes (
                          {getVotePercentage(winner).toFixed(1)}%)
                        </Text>
                        <Text style={styles.winnerLabel}>WINNER</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* All Candidates */}
              <View style={styles.candidatesList}>
                {candidates.map((candidate, index) => {
                  const percentage = getVotePercentage(candidate);
                  const rank = index + 1;

                  return (
                    <View
                      key={candidate.id}
                      style={[
                        styles.resultItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <View style={styles.candidateRank}>
                        <Text
                          style={[styles.rankNumber, { color: colors.primary }]}
                        >
                          {rank}
                        </Text>
                        <Text
                          style={[
                            styles.rankSuffix,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {getRankSuffix(rank)}
                        </Text>
                      </View>

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
                      </View>

                      <View style={styles.candidateInfo}>
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

                        <View style={styles.voteBar}>
                          <View
                            style={[
                              styles.voteBarBackground,
                              { backgroundColor: colors.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.voteBarFill,
                                {
                                  width: `${percentage}%`,
                                  backgroundColor:
                                    rank === 1
                                      ? colors.success
                                      : colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.voteText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {candidate.vote_count} votes (
                            {percentage.toFixed(1)}%)
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

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
      flexDirection: "row",
      alignItems: "center",
    },
    electionTabText: {
      fontSize: 14,
      fontWeight: "500",
      marginRight: 8,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
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
    summaryGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    summaryItem: {
      alignItems: "center",
    },
    summaryNumber: {
      fontSize: 32,
      fontWeight: "bold",
    },
    summaryLabel: {
      fontSize: 14,
      marginTop: 4,
    },
    positionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    positionTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    totalVotesText: {
      fontSize: 14,
      fontWeight: "500",
    },
    winnerCard: {
      marginBottom: 20,
      borderRadius: 12,
      overflow: "hidden",
    },
    winnerGradient: {
      padding: 20,
    },
    winnerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    winnerImageContainer: {
      position: "relative",
      marginRight: 15,
    },
    winnerImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 3,
      borderColor: "white",
    },
    winnerImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#667eea",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "white",
    },
    winnerInitials: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    crownIcon: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "white",
      borderRadius: 12,
      padding: 4,
    },
    winnerDetails: {
      flex: 1,
    },
    winnerName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 4,
    },
    winnerVotes: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    winnerLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#d4af37",
      letterSpacing: 1,
    },
    candidatesList: {
      gap: 15,
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderRadius: 12,
    },
    candidateRank: {
      alignItems: "center",
      marginRight: 15,
      minWidth: 30,
    },
    rankNumber: {
      fontSize: 20,
      fontWeight: "bold",
    },
    rankSuffix: {
      fontSize: 10,
      marginTop: -2,
    },
    candidateImageContainer: {
      marginRight: 15,
    },
    candidateImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    candidateImagePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    candidateInitials: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    candidateInfo: {
      flex: 1,
    },
    candidateName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    candidateLevel: {
      fontSize: 12,
      marginBottom: 8,
    },
    voteBar: {
      gap: 6,
    },
    voteBarBackground: {
      height: 6,
      borderRadius: 3,
      overflow: "hidden",
    },
    voteBarFill: {
      height: "100%",
      borderRadius: 3,
    },
    voteText: {
      fontSize: 12,
      fontWeight: "500",
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
