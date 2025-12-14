/**
 * Web-compatible image picker implementation
 * Uses HTML file input for web platform
 */

export interface ImagePickerResult {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    width?: number;
    height?: number;
    type?: 'image' | 'video';
  }>;
}

export interface MediaLibraryPermissionResponse {
  status: 'granted' | 'denied' | 'undetermined';
  expires: 'never' | number;
  canAskAgain: boolean;
  granted: boolean;
}

export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
};

export async function requestMediaLibraryPermissionsAsync(): Promise<MediaLibraryPermissionResponse> {
  // Web doesn't require permissions for file input
  return {
    status: 'granted',
    expires: 'never',
    canAskAgain: true,
    granted: true,
  };
}

export async function launchImageLibraryAsync(options?: {
  mediaTypes?: string;
  allowsEditing?: boolean;
  quality?: number;
}): Promise<ImagePickerResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        resolve({ canceled: true });
        return;
      }

      // Convert file to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const uri = event.target?.result as string;
        resolve({
          canceled: false,
          assets: [{
            uri,
            type: 'image',
          }],
        });
      };

      reader.onerror = () => {
        resolve({ canceled: true });
      };

      reader.readAsDataURL(file);
    };

    input.oncancel = () => {
      resolve({ canceled: true });
    };

    input.click();
  });
}
