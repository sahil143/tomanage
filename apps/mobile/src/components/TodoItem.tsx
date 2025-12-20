import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Todo, Priority } from '../types/todo';
import { shadows } from '../utils/shadows';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onPress,
}) => {
  const priorityColors: Record<Priority, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
    none: '#9ca3af',
  };

  const urgencyColors: Record<string, string> = {
    overdue: '#dc2626',
    critical: '#ea580c',
    today: '#f59e0b',
    tomorrow: '#84cc16',
    'this-week': '#10b981',
    future: '#6b7280',
    none: '#9ca3af',
  };

  const getEnergyIcons = (energy: string | undefined) => {
    const count = energy === 'high' ? 3 : energy === 'medium' ? 2 : 1;
    return '⚡'.repeat(count);
  };

  const renderRightActions = () => (
    <Pressable
      style={styles.deleteButton}
      onPress={() => onDelete(todo.id)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        style={[styles.card, todo.completed && styles.completedCard]}
        onPress={() => onPress?.(todo)}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Checkbox */}
          <Pressable
            onPress={() => onToggle(todo.id)}
            style={styles.checkbox}
          >
            <Ionicons
              name={
                todo.completed
                  ? ('checkmark-circle' as any)
                  : ('ellipse-outline' as any)
              }
              size={28}
              color={priorityColors[todo.priority]}
            />
          </Pressable>

          {/* Text Content */}
          <View style={styles.textContent}>
            {/* Title */}
            <Text
              style={[
                styles.title,
                todo.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {todo.title}
            </Text>

            {/* Description */}
            {todo.description && (
              <Text
                style={[
                  styles.description,
                  todo.completed && styles.completedText,
                ]}
                numberOfLines={2}
              >
                {todo.description}
              </Text>
            )}

            {/* Metadata Row */}
            <View style={styles.metadata}>
              {/* Priority Indicator */}
              <View style={styles.metadataItem}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priorityColors[todo.priority] },
                  ]}
                />
                <Text style={styles.metadataText}>{todo.priority}</Text>
              </View>

              {/* Energy */}
              {todo.energyRequired && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataText}>
                    {getEnergyIcons(todo.energyRequired)}
                  </Text>
                </View>
              )}

              {/* Duration */}
              {todo.estimatedDuration && (
                <View style={styles.metadataItem}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={styles.metadataText}>
                    {todo.estimatedDuration}m
                  </Text>
                </View>
              )}

              {/* Due Date */}
              {todo.dueDate && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={urgencyColors[todo.urgency || 'none']}
                  />
                  <Text
                    style={[
                      styles.metadataText,
                      { color: urgencyColors[todo.urgency || 'none'] },
                    ]}
                  >
                    {new Date(todo.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {todo.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {todo.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {todo.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>
                    +{todo.tags.length - 3}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    ...shadows.medium,
  },
  completedCard: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#9ca3af',
    paddingVertical: 4,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
