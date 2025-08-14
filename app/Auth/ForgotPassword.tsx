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
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { forgotPassword } = useAuth();

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = async () => {
    await handleSendResetEmail();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient colors={['#4facfe', '#00f2fe', '#667eea']} style={styles.gradient}>
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, { top: 120, left: 30, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { top: 250, right: 40, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { bottom: 200, left: 60, opacity: fadeAnim }]} />
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
            {!emailSent ? (
              // Email Input Step
              <>
                <View style={styles.headerContainer}>
                  <Ionicons name="key" size={50} color="#4facfe" />
                  <Text style={styles.title}>Mot de passe oublié</Text>
                  <Text style={styles.subtitle}>
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </Text>
                </View>

                <View style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={20} color="#4facfe" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Adresse email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                      placeholderTextColor="#999"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleSendResetEmail}
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                  >
                    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Envoyer le lien</Text>
                          <Ionicons name="send" size={20} color="white" style={styles.buttonIcon} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.helpText}>
                    <Ionicons name="information-circle" size={16} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.helpTextContent}>
                      Vous recevrez un email avec les instructions pour réinitialiser votre mot de passe
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // Email Sent Confirmation
              <>
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                  <Text style={styles.successTitle}>Email envoyé!</Text>
                  <Text style={styles.successText}>
                    Nous avons envoyé un lien de réinitialisation à:
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                  
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>Étapes suivantes:</Text>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>1</Text>
                      <Text style={styles.instructionText}>Vérifiez votre boîte email</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>2</Text>
                      <Text style={styles.instructionText}>Cliquez sur le lien reçu</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>3</Text>
                      <Text style={styles.instructionText}>Créez un nouveau mot de passe</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={handleResendEmail}
                    style={styles.resendButton}
                    disabled={loading}
                  >
                    <Text style={styles.resendText}>Renvoyer l'email</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={handleBackToLogin}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={styles.backButtonText}>Retour à la connexion</Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContent: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  helpText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  helpTextContent: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    gap: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  instructionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4facfe',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
  },
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
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

export default ForgotPassword;