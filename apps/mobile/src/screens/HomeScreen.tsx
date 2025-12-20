import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from '../components/TodoItem';
import { Todo } from '../types/todo';

type FilterType = 'all' | 'active' | 'completed';

export const HomeScreen: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();

  const { todos, loading, error, loadTodos, toggleComplete, deleteTodo, syncWithTickTick } = useTodoStore();

  useEffect(() => {
    loadTodos();
  }, []);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncWithTickTick();
    } finally {
      setRefreshing(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>ToManage</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Task Manager</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable
          onPress={() => syncWithTickTick()}
          style={styles.iconButton}
          disabled={loading}
        >
          <Ionicons
            name="sync"
            size={24}
            color={loading ? '#9ca3af' : '#3b82f6'}
          />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color="#6b7280" />
        </Pressable>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {(['all', 'active', 'completed'] as FilterType[]).map((type) => (
        <Pressable
          key={type}
          style={[
            styles.filterTab,
            filter === type && styles.filterTabActive,
          ]}
          onPress={() => setFilter(type)}
        >
          <Text
            style={[
              styles.filterText,
              filter === type && styles.filterTextActive,
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
          <View
            style={[
              styles.badge,
              filter === type && styles.badgeActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                filter === type && styles.badgeTextActive,
              ]}
            >
              {counts[type]}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkbox-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No tasks {filter !== 'all' ? filter : ''}</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? 'Start by adding your first task or sync with TickTick'
          : `You have no ${filter} tasks`}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeleton}>
          <View style={styles.skeletonCircle} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '60%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={toggleComplete}
      onDelete={deleteTodo}
      onPress={(todo) => {
        // TODO: Navigate to detail screen
        console.log('Todo pressed:', todo.title);
      }}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderFilters()}

      {loading && !refreshing ? (
        renderLoading()
      ) : (
        <FlatList
          data={filteredTodos}
          renderItem={renderItem}
          keyExtractor={(item: Todo) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#eff6ff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#3b82f6',
  },
  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  badgeTextActive: {
    color: '#fff',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    padding: 16,
  },
  skeleton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  skeletonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
  },
});
