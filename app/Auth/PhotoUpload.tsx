import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const PhotoUpload: React.FC = () => {
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Permission d\'accès à la galerie requise');
      return;
    }

    Alert.alert(
      'Photo de profil',
      'Sélectionnez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: () => handleImageSelection() },
        { text: 'Appareil photo', onPress: () => handleCameraSelection() }
      ]
    );
  };

  const handleImageSelection = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleCameraSelection = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Permission d\'accès à l\'appareil photo requise');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (imageUri: string) => {
    const formData = new FormData();
    formData.append('profilePhoto', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    try {
      const response = await fetch('http://192.168.1.76:3000/api/v1/auth/upload-profile-photo', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!profilePhoto) {
      Alert.alert('Aucune photo', 'Veuillez sélectionner une photo ou passer cette étape');
      return;
    }

    setLoading(true);
    try {
      await uploadProfilePhoto(profilePhoto);
      
      Alert.alert(
        '✅ Photo uploadée!',
        'Votre photo de profil a été uploadée avec succès. Vous pouvez maintenant vous connecter.',
        [{ text: 'Se connecter', onPress: () => router.replace('/Auth/Login') }]
      );
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Erreur', 'Impossible d\'uploader la photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Passer cette étape',
      'Vous pourrez ajouter une photo plus tard dans votre profil',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Passer', onPress: () => router.replace('/Auth/Login') }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#f093fb', '#f5576c', '#4facfe']}
        style={styles.gradient}
      >
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, { top: 100, right: 30, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { top: 200, left: 40, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { bottom: 150, right: 50, opacity: fadeAnim }]} />
        </View>

        <Animated.View style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <View style={styles.headerContainer}>
              <Ionicons name="camera" size={50} color="#f5576c" />
              <Text style={styles.title}>Photo de profil</Text>
              <Text style={styles.subtitle}>
                Ajoutez une photo pour personnaliser votre profil
              </Text>
            </View>

            <View style={styles.photoContainer}>
              <TouchableOpacity 
                onPress={pickImage}
                style={styles.photoUpload}
                disabled={loading}
              >
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={40} color="#f5576c" />
                    <Text style={styles.placeholderText}>Ajouter une photo</Text>
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="add-circle" size={28} color="#f5576c" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={handleUpload}
                disabled={loading || !profilePhoto}
                style={[styles.button, (!profilePhoto || loading) && styles.buttonDisabled]}
              >
                <LinearGradient colors={['#f5576c', '#f093fb']} style={styles.buttonGradient}>
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Uploader la photo</Text>
                      <Ionicons name="cloud-upload" size={20} color="white" style={styles.buttonIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSkip}
                style={styles.skipButton}
                disabled={loading}
              >
                <Text style={styles.skipText}>Passer cette étape</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.infoText}>
                Vous pourrez modifier votre photo à tout moment dans les paramètres
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  blurContainer: {
    borderRadius: 25,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoUpload: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(245, 87, 108, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#f5576c',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});

export default PhotoUpload;