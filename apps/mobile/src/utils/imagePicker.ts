/**
 * Cross-platform image picker
 * Uses expo-image-picker on native platforms
 * Uses HTML file input on web
 */

import { Platform } from 'react-native';

let requestMediaLibraryPermissionsAsync: any;
let launchImageLibraryAsync: any;
let MediaTypeOptions: any;

if (Platform.OS === 'web') {
  // Use web implementation
  const webPicker = require('./imagePicker.web');
  requestMediaLibraryPermissionsAsync = webPicker.requestMediaLibraryPermissionsAsync;
  launchImageLibraryAsync = webPicker.launchImageLibraryAsync;
  MediaTypeOptions = webPicker.MediaTypeOptions;
} else {
  // Use native expo-image-picker
  const nativePicker = require('expo-image-picker');
  requestMediaLibraryPermissionsAsync = nativePicker.requestMediaLibraryPermissionsAsync;
  launchImageLibraryAsync = nativePicker.launchImageLibraryAsync;
  MediaTypeOptions = nativePicker.MediaTypeOptions;
}

export {
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
};
