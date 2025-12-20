import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from '../utils/imagePicker';
import { useChatStore } from '../store/chatStore';
import { ChatBubble } from '../components/ChatBubble';
import { QuickActionButtons } from '../components/QuickActionButtons';
import { RecommendationMethod } from '../types/chat';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const { messages, loading, sendMessage, getRecommendation, clearChat } = useChatStore();

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    try {
      await sendMessage(inputText, selectedImage || undefined);
      setInputText('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to attach images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleMethodSelect = async (method: RecommendationMethod) => {
    try {
      await getRecommendation(method);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>AI Assistant</Text>
      <Pressable onPress={clearChat} style={styles.clearButton}>
        <Ionicons name="trash-outline" size={20} color="#6b7280" />
        <Text style={styles.clearText}>Clear</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Chat with AI Assistant</Text>
      <Text style={styles.emptyText}>
        Ask me to help you manage your tasks, or use the quick actions below
      </Text>

      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Try asking:</Text>
        {[
          'Add task: Review pull requests',
          'What should I work on now?',
          'Show me quick wins',
        ].map((example, index) => (
          <Pressable
            key={index}
            style={styles.exampleChip}
            onPress={() => setInputText(example)}
          >
            <Text style={styles.exampleText}>{example}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <ChatBubble message={item} />}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmpty}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Pressable
                onPress={() => setSelectedImage(null)}
                style={styles.removeImageButton}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </Pressable>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Image Picker Button */}
            <Pressable onPress={handleImagePick} style={styles.iconButton}>
              <Ionicons name="image-outline" size={24} color="#6b7280" />
            </Pressable>

            {/* Text Input */}
            <TextInput
              style={styles.input}
              placeholder="Ask AI to help with tasks..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImage) || loading}
              style={[
                styles.sendButton,
                ((!inputText.trim() && !selectedImage) || loading) && styles.sendButtonDisabled,
              ]}
            >
              <Ionicons
                name="send"
                size={20}
                color={((!inputText.trim() && !selectedImage) || loading) ? '#9ca3af' : '#fff'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Quick Action Buttons */}
      <QuickActionButtons onMethodSelect={handleMethodSelect} loading={loading} />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  examplesContainer: {
    marginTop: 32,
    width: '100%',
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },
  loadingText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  imagePreview: {
    marginBottom: 12,
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: 8,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});
