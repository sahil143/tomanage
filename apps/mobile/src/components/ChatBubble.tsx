import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../types/chat';
import { shadows } from '../utils/shadows';

interface ChatBubbleProps {
  message: ChatMessage;
  onCopy?: (text: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onCopy }) => {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    // TODO: Implement clipboard functionality with expo-clipboard
    // For now, just call the callback
    onCopy?.(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Check for bold (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);

      return (
        <Text key={index} style={styles.messageText}>
          {parts.map((part, i) => {
            // Odd indices are bold text
            if (i % 2 === 1) {
              return (
                <Text key={i} style={styles.boldText}>
                  {part}
                </Text>
              );
            }
            return part;
          })}
          {'\n'}
        </Text>
      );
    });
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {/* Image if present */}
        {message.hasImage && message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Message Content */}
        <View style={styles.content}>{formatContent(message.content)}</View>

        {/* Timestamp and Actions Row */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>

          {/* Copy button for assistant messages */}
          {!isUser && (
            <Pressable onPress={handleCopy} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    ...shadows.small,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  content: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111827',
  },
  boldText: {
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  copyButton: {
    padding: 4,
  },
});
