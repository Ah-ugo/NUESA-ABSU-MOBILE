import {
  TriangleAlert as AlertTriangle,
  Bell,
  Info,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Announcement } from "../../types/api";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SPACING,
} from "../../utils/constants";
import { formatDateTime } from "../../utils/formatters";
import { Card } from "../ui/Card";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const getPriorityIcon = () => {
    switch (announcement.priority) {
      case "urgent":
        return <AlertTriangle size={20} color={COLORS.error} />;
      case "high":
        return <Bell size={20} color={COLORS.warning} />;
      default:
        return <Info size={20} color={COLORS.primary} />;
    }
  };

  const getPriorityColor = () => {
    switch (announcement.priority) {
      case "urgent":
        return COLORS.error;
      case "high":
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{getPriorityIcon()}</View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{announcement.title}</Text>
          <Text style={styles.date}>
            {formatDateTime(announcement.created_at)}
          </Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor() },
          ]}
        >
          <Text style={styles.priorityText}>
            {announcement.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.content}>{announcement.content}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700", // Changed from FONT_WEIGHTS.bold
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  priorityBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "500", // Changed from FONT_WEIGHTS.medium
    color: COLORS.white,
  },
  content: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
});
