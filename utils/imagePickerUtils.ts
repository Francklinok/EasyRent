/**
 * Image Picker Utility with Android fallback
 * Handles the ActivityNotFoundException on Android devices/emulators
 * that don't support the modern Photo Picker API
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PickImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  videoMaxDuration?: number;
  allowsMultipleSelection?: boolean;
}

export interface PickImageResult {
  canceled: boolean;
  assets?: ImagePicker.ImagePickerAsset[];
}

/**
 * Launch image library with fallback for Android
 * Automatically falls back to legacy picker if modern picker fails
 */
export const launchImageLibraryWithFallback = async (
  options: PickImageOptions = {}
): Promise<PickImageResult> => {
  try {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Permission d\'accès à la galerie requise'
      );
      return { canceled: true };
    }

    // Try with modern picker first
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect,
      quality: options.quality ?? 0.8,
      videoMaxDuration: options.videoMaxDuration,
      allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    });

    return result;
  } catch (error: any) {
    // Check if it's the ActivityNotFoundException
    const isActivityNotFound =
      error?.message?.includes('ActivityNotFoundException') ||
      error?.message?.includes('PICK_IMAGES');

    if (Platform.OS === 'android' && isActivityNotFound) {
      console.log('Modern picker not available, falling back to legacy picker');

      try {
        // Fallback to legacy picker on Android
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
          allowsEditing: options.allowsEditing ?? true,
          aspect: options.aspect,
          quality: options.quality ?? 0.8,
          videoMaxDuration: options.videoMaxDuration,
          allowsMultipleSelection: options.allowsMultipleSelection ?? false,
          // @ts-ignore - legacy option exists but not in types
          legacy: true,
        });

        return result;
      } catch (legacyError) {
        console.error('Legacy picker also failed:', legacyError);
        Alert.alert(
          'Erreur',
          'Impossible d\'accéder à la galerie. Veuillez vérifier que votre appareil dispose d\'une application de galerie.'
        );
        return { canceled: true };
      }
    }

    // Other errors
    console.error('Image picker error:', error);
    Alert.alert('Erreur', 'Impossible de sélectionner une image');
    return { canceled: true };
  }
};

/**
 * Launch camera with proper error handling
 */
export const launchCameraWithFallback = async (
  options: PickImageOptions = {}
): Promise<PickImageResult> => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Permission d\'accès à l\'appareil photo requise'
      );
      return { canceled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect,
      quality: options.quality ?? 0.8,
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
    });

    return result;
  } catch (error) {
    console.error('Camera error:', error);
    Alert.alert('Erreur', 'Impossible d\'accéder à l\'appareil photo');
    return { canceled: true };
  }
};

/**
 * Show action sheet to choose between camera and gallery
 */
export const showImagePickerOptions = (
  onGallery: () => void,
  onCamera: () => void
) => {
  Alert.alert(
    'Photo de profil',
    'Sélectionnez une option',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Galerie', onPress: onGallery },
      { text: 'Appareil photo', onPress: onCamera }
    ]
  );
};
