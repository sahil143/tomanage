import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TickTickAuthButtonExpo } from '../components/TickTickAuthButtonExpo';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = React.useState(true);
  const [autoSync, setAutoSync] = React.useState(true);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Settings</Text>
    </View>
  );

  const renderSection = (title: string, items: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <Pressable
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#3b82f6" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView style={styles.content}>
        {/* Account Section */}
        {renderSection(
          'Account',
          <>
            <TickTickAuthButtonExpo
              onAuthSuccess={() => {
                console.log('TickTick connected successfully');
              }}
              onAuthError={(error) => {
                console.error('TickTick auth error:', error);
              }}
            />
            {renderSettingItem(
              'key-outline',
              'Anthropic API Key',
              'Configure AI features',
              () => {
                // TODO: Implement API key input
                console.log('Configure API key');
              }
            )}
          </>
        )}

        {/* Sync Section */}
        {renderSection(
          'Sync',
          <>
            {renderSettingItem(
              'sync',
              'Auto Sync',
              'Automatically sync with TickTick',
              undefined,
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={autoSync ? '#3b82f6' : '#f3f4f6'}
              />
            )}
            {renderSettingItem(
              'cloud-upload-outline',
              'Sync Now',
              'Last synced: Never',
              () => {
                // TODO: Trigger sync
                console.log('Sync now');
              }
            )}
          </>
        )}

        {/* Notifications Section */}
        {renderSection(
          'Notifications',
          <>
            {renderSettingItem(
              'notifications-outline',
              'Push Notifications',
              'Get notified about tasks',
              undefined,
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={notifications ? '#3b82f6' : '#f3f4f6'}
              />
            )}
          </>
        )}

        {/* Preferences Section */}
        {renderSection(
          'Preferences',
          <>
            {renderSettingItem(
              'color-palette-outline',
              'Theme',
              'Light',
              () => {
                // TODO: Implement theme picker
                console.log('Theme settings');
              }
            )}
            {renderSettingItem(
              'time-outline',
              'Work Hours',
              '9:00 AM - 5:00 PM',
              () => {
                // TODO: Implement work hours picker
                console.log('Work hours settings');
              }
            )}
            {renderSettingItem(
              'calendar-outline',
              'Weekend',
              'Saturday, Sunday',
              () => {
                // TODO: Implement weekend picker
                console.log('Weekend settings');
              }
            )}
          </>
        )}

        {/* About Section */}
        {renderSection(
          'About',
          <>
            {renderSettingItem(
              'information-circle-outline',
              'Version',
              '1.0.0'
            )}
            {renderSettingItem(
              'help-circle-outline',
              'Help & Support',
              undefined,
              () => {
                console.log('Help');
              }
            )}
            {renderSettingItem(
              'document-text-outline',
              'Privacy Policy',
              undefined,
              () => {
                console.log('Privacy Policy');
              }
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with AI • Powered by Claude
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
