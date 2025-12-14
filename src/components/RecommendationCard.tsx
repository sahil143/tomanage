import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../utils/shadows';

interface RecommendationCardProps {
  recommendation: string;
  onStart?: () => void;
  onDismiss?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onStart,
  onDismiss,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Parse recommendation to extract key sections
  const parseRecommendation = (text: string) => {
    const sections: {
      taskTitle?: string;
      reasoning?: string;
      timeEstimate?: string;
      alternatives?: string[];
    } = {};

    // Extract task title (look for "RECOMMENDED TASK:" or similar)
    const taskMatch = text.match(
      /(?:\*\*)?RECOMMENDED TASK(?:\*\*)?:?\s*(.+?)(?:\n|$)/i
    );
    if (taskMatch) {
      sections.taskTitle = taskMatch[1].trim();
    }

    // Extract reasoning (look for "WHY NOW:" or "WHY THIS TASK:")
    const reasoningMatch = text.match(
      /(?:\*\*)?WHY (?:NOW|THIS TASK)(?:\*\*)?:?\s*(.+?)(?:\n\n|\*\*|$)/is
    );
    if (reasoningMatch) {
      sections.reasoning = reasoningMatch[1].trim().substring(0, 150) + '...';
    }

    // Extract time estimate
    const timeMatch = text.match(
      /(?:\*\*)?(?:ESTIMATED TIME|TIME ESTIMATE|Duration)(?:\*\*)?:?\s*(.+?)(?:\n|$)/i
    );
    if (timeMatch) {
      sections.timeEstimate = timeMatch[1].trim();
    }

    // Extract alternatives
    const altMatch = text.match(
      /(?:\*\*)?ALTERNATIVES(?:\*\*)?:?\s*(.+?)(?:\n\n|\*\*[A-Z]|$)/is
    );
    if (altMatch) {
      const altText = altMatch[1].trim();
      sections.alternatives = altText
        .split(/\n/)
        .filter((line) => line.trim().length > 0)
        .slice(0, 2);
    }

    return sections;
  };

  const parsed = parseRecommendation(recommendation);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.gradientBorder}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="bulb" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.headerTitle}>AI Recommendation</Text>
            <Pressable onPress={onDismiss} style={styles.dismissButton}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </Pressable>
          </View>

          {/* Task Title */}
          {parsed.taskTitle && (
            <View style={styles.section}>
              <Text style={styles.taskTitle}>{parsed.taskTitle}</Text>
            </View>
          )}

          {/* Reasoning */}
          {parsed.reasoning && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Why now:</Text>
              <Text style={styles.sectionText}>{parsed.reasoning}</Text>
            </View>
          )}

          {/* Time Estimate */}
          {parsed.timeEstimate && (
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.timeText}>{parsed.timeEstimate}</Text>
            </View>
          )}

          {/* Alternatives (if any) */}
          {parsed.alternatives && parsed.alternatives.length > 0 && (
            <View style={styles.alternativesContainer}>
              <Text style={styles.sectionLabel}>Alternatives:</Text>
              {parsed.alternatives.map((alt, index) => (
                <Text key={index} style={styles.alternativeText}>
                  • {alt}
                </Text>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={onStart}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Task</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onDismiss}
            >
              <Text style={styles.secondaryButtonText}>View Full Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 3,
    backgroundColor: '#3b82f6',
    ...shadows.glow,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dismissButton: {
    padding: 4,
  },
  section: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  alternativesContainer: {
    marginBottom: 16,
  },
  alternativeText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 4,
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '600',
  },
});
