import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecommendationMethod } from '../types/chat';
import { shadows } from '../utils/shadows';

interface QuickActionButtonsProps {
  onMethodSelect: (method: RecommendationMethod) => void;
  loading?: boolean;
}

const methods: Array<{ method: RecommendationMethod; icon: string; label: string }> = [
  { method: 'smart', icon: '💡', label: 'Smart' },
  { method: 'energy', icon: '⚡', label: 'Energy' },
  { method: 'quick', icon: '🎯', label: 'Quick' },
  { method: 'focus', icon: '🔥', label: 'Focus' },
  { method: 'eisenhower', icon: '📊', label: 'Matrix' },
];

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onMethodSelect,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
      {/* Method Buttons */}
      {expanded &&
        methods.map((item, index) => (
          <Animated.View
            key={item.method}
            style={[
              styles.methodButton,
              { transform: [{ translateY: -(index + 1) * 60 }] },
            ]}
          >
            <Pressable
              onPress={() => {
                onMethodSelect(item.method);
                setExpanded(false);
              }}
              disabled={loading}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          </Animated.View>
        ))}

      {/* Main FAB */}
      <Pressable
        onPress={toggleExpanded}
        disabled={loading}
        style={[styles.button, styles.mainButton, loading && styles.disabledButton]}
      >
        <Text style={styles.mainIcon}>{expanded ? '✕' : '+'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
  methodButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  mainButton: {
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mainIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
