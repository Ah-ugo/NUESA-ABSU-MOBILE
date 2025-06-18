import { Trophy, User } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Candidate } from "../../types/api";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SPACING,
} from "../../utils/constants";
import { truncateText } from "../../utils/formatters";
import { Card } from "../ui/Card";

interface CandidateCardProps {
  candidate: Candidate;
  onPress?: () => void;
  showVoteCount?: boolean;
  showVoteButton?: boolean;
  onVote?: () => void;
  isVoted?: boolean;
  disabled?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onPress,
  showVoteCount = false,
  showVoteButton = false,
  onVote,
  isVoted = false,
  disabled = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleVote = () => {
    if (onVote && !disabled && !isVoted) {
      onVote();
    }
  };

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {candidate.photo ? (
              <Image source={{ uri: candidate.photo }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <User size={32} color={COLORS.gray[400]} />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{candidate.fullName}</Text>
            <Text style={styles.position}>{candidate.position}</Text>
            <Text style={styles.level}>Level: {candidate.level}</Text>
            {candidate.department && (
              <Text style={styles.department}>{candidate.department}</Text>
            )}
          </View>

          {showVoteCount && (
            <View style={styles.voteCount}>
              <Trophy size={16} color={COLORS.accent} />
              <Text style={styles.voteCountText}>{candidate.vote_count}</Text>
            </View>
          )}
        </View>

        <View style={styles.manifestoContainer}>
          <Text style={styles.manifestoLabel}>Manifesto:</Text>
          <Text style={styles.manifesto}>
            {truncateText(candidate.manifesto, 150)}
          </Text>
        </View>

        {showVoteButton && (
          <TouchableOpacity
            style={[
              styles.voteButton,
              isVoted && styles.votedButton,
              disabled && styles.disabledButton,
            ]}
            onPress={handleVote}
            disabled={disabled || isVoted}
          >
            <Text
              style={[
                styles.voteButtonText,
                isVoted && styles.votedButtonText,
                disabled && styles.disabledButtonText,
              ]}
            >
              {isVoted ? "Voted" : "Vote"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  imageContainer: {
    marginRight: SPACING.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700", // Changed from FONT_WEIGHTS.bold
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  position: {
    fontSize: FONT_SIZES.base,
    fontWeight: "500", // Changed from FONT_WEIGHTS.medium
    color: COLORS.primary,
    marginBottom: 2,
  },
  level: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  department: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  voteCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  voteCountText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500", // Changed from FONT_WEIGHTS.medium
    color: COLORS.accent,
  },
  manifestoContainer: {
    marginBottom: SPACING.md,
  },
  manifestoLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500", // Changed from FONT_WEIGHTS.medium
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  manifesto: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  voteButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  votedButton: {
    backgroundColor: COLORS.success,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[300],
  },
  voteButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: "600", // Changed from FONT_WEIGHTS.semibold
  },
  votedButtonText: {
    color: COLORS.white,
  },
  disabledButtonText: {
    color: COLORS.gray[500],
  },
});
