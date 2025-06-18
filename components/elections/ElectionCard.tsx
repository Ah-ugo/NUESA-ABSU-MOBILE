import { Calendar, Clock, MapPin, Users } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Election } from "../../types/api";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SPACING,
} from "../../utils/constants";
import {
  capitalizeFirst,
  formatDate,
  formatTimeRemaining,
  getElectionStatus,
} from "../../utils/formatters";
import { Card } from "../ui/Card";

interface ElectionCardProps {
  election: Election;
  onPress?: () => void;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  onPress,
}) => {
  const statusInfo = getElectionStatus(
    election.start_date,
    election.end_date,
    election.status
  );

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{election.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <Text style={styles.statusText}>{statusInfo.status}</Text>
            </View>
          </View>

          <View style={styles.typeContainer}>
            <Users size={16} color={COLORS.gray[500]} />
            <Text style={styles.typeText}>
              {capitalizeFirst(election.election_type)} Election
            </Text>
          </View>
        </View>

        {election.description && (
          <Text style={styles.description}>{election.description}</Text>
        )}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>
              Starts: {formatDate(election.start_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>
              {formatTimeRemaining(election.end_date)}
            </Text>
          </View>

          {election.department && (
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.gray[500]} />
              <Text style={styles.detailText}>{election.department}</Text>
            </View>
          )}
        </View>

        <Text style={styles.statusDescription}>{statusInfo.description}</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: "700", // Changed from FONT_WEIGHTS.bold
    color: COLORS.gray[900],
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "500", // Changed from FONT_WEIGHTS.medium
    color: COLORS.white,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  details: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  detailText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  statusDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    fontStyle: "italic",
  },
});
