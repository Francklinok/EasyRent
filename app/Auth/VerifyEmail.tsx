import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyAccount, resendVerification } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!email) {
      Alert.alert('Erreur', 'Email manquant pour la vérification.', [
        { text: 'OK', onPress: () => router.replace('/Auth/Register') }
      ]);
      return;
    }

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
  }, [email]);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Code requis', 'Veuillez entrer le code de vérification');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Code invalide', 'Le code doit contenir 6 caractères');
      return;
    }

    if (!email) {
      Alert.alert('Erreur', 'Email manquant');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyAccount(email, verificationCode);
      if (result.success) {
        Alert.alert(
          'Compte vérifié!', 
          'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
          [
            { 
              text: 'Se connecter', 
              onPress: () => router.replace('/Auth/Login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setResendLoading(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        Alert.alert('Code renvoyé', 'Un nouveau code de vérification a été envoyé à votre email.');
        setVerificationCode(''); // Clear current code
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToRegister = () => {
    router.back();
  };

  const formatCode = (text: string) => {
    // Only allow numbers and limit to 6 characters
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(cleaned);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient colors={['#4facfe', '#00f2fe', '#43e97b']} style={styles.gradient}>
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, { top: 100, left: 40, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { top: 200, right: 30, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { bottom: 150, left: 50, opacity: fadeAnim }]} />
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
              <Ionicons name="mail-open" size={60} color="#4facfe" />
              <Text style={styles.title}>Vérifiez votre email</Text>
              <Text style={styles.subtitle}>
                Nous avons envoyé un code de vérification à:
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.instructionText}>
                Entrez le code à 6 chiffres reçu par email
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  placeholder="000000"
                  value={verificationCode}
                  onChangeText={formatCode}
                  keyboardType="numeric"
                  style={styles.codeInput}
                  maxLength={6}
                  editable={!loading}
                  placeholderTextColor="#999"
                  textAlign="center"
                />
              </View>

              <TouchableOpacity 
                onPress={handleVerifyCode}
                style={[styles.button, loading && styles.buttonDisabled]}
                disabled={loading || verificationCode.length !== 6}
              >
                <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.buttonGradient}>
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Vérifier</Text>
                      <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>Vous n'avez pas reçu le code?</Text>
                <TouchableOpacity 
                  onPress={handleResendCode}
                  style={styles.resendButton}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <ActivityIndicator color="rgba(255, 255, 255, 0.8)" size="small" />
                  ) : (
                    <Text style={styles.resendText}>Renvoyer le code</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Conseils:</Text>
                <View style={styles.tipItem}>
                  <Ionicons name="time" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.tipText}>Le code expire dans 10 minutes</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="folder" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.tipText}>Vérifiez votre dossier spam</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.tipText}>Vous pouvez renvoyer le code si nécessaire</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={handleBackToRegister}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={styles.backButtonText}>Retour à l'inscription</Text>
            </TouchableOpacity>
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  formContent: {
    gap: 20,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  codeInputContainer: {
    alignItems: 'center',
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 8,
    width: '80%',
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
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
  helpContainer: {
    alignItems: 'center',
    gap: 10,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resendButton: {
    padding: 5,
  },
  resendText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 15,
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VerifyEmail;