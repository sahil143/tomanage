import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ChatScreen } from '../screens/ChatScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  TodoDetail: { todoId: string };
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tablet Split View Component
const TabletSplitView: React.FC = () => {
  return (
    <View style={styles.splitContainer}>
      <View style={styles.leftPane}>
        <HomeScreen />
      </View>
      <View style={styles.rightPane}>
        <ChatScreen />
      </View>
    </View>
  );
};

// Mobile Tab Navigator
const MobileTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'AI Chat',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Main Content (responsive based on screen size)
const MainContent: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // if (isTablet) {
  //   return <TabletSplitView />;
  // }

  return <MobileTabNavigator />;
};

// Root Stack Navigator
const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainContent} />
      {/* Add more screens here as needed */}
      {/* Example: <Stack.Screen name="TodoDetail" component={TodoDetailScreen} /> */}
    </Stack.Navigator>
  );
};

// App Navigator (Main Export)
export const AppNavigator: React.FC = () => {
  return <RootNavigator />;
};

export default AppNavigator;

const styles = StyleSheet.create({
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  rightPane: {
    flex: 1,
  },
});
