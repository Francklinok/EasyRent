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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!token) {
      Alert.alert('Lien invalide', 'Le lien de réinitialisation est invalide ou a expiré.', [
        { text: 'OK', onPress: () => router.replace('/Auth/Login') }
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
  }, [token]);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      Alert.alert(
        'Mot de passe faible', 
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      );
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Mot de passe requis', 'Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mots de passe différents', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!token) {
      Alert.alert('Erreur', 'Token de réinitialisation manquant');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setResetSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/Auth/Login');
  };

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    let strength = 0;
    let text = 'Très faible';
    let color = '#f44336';

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        text = 'Très faible';
        color = '#f44336';
        break;
      case 2:
        text = 'Faible';
        color = '#ff9800';
        break;
      case 3:
        text = 'Moyen';
        color = '#ffeb3b';
        break;
      case 4:
        text = 'Fort';
        color = '#8bc34a';
        break;
      case 5:
        text = 'Très fort';
        color = '#4caf50';
        break;
    }

    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gradient}>
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, { top: 100, right: 30, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { top: 220, left: 40, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { bottom: 180, right: 50, opacity: fadeAnim }]} />
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
            {!resetSuccess ? (
              // Password Reset Form
              <>
                <View style={styles.headerContainer}>
                  <Ionicons name="lock-open" size={50} color="#667eea" />
                  <Text style={styles.title}>Nouveau mot de passe</Text>
                  <Text style={styles.subtitle}>
                    Créez un mot de passe sécurisé pour votre compte
                  </Text>
                </View>

                <View style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nouveau mot de passe"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      placeholderTextColor="#999"
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#667eea" 
                      />
                    </TouchableOpacity>
                  </View>

                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.strengthBar}>
                        <View 
                          style={[
                            styles.strengthFill, 
                            { 
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: passwordStrength.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                        {passwordStrength.text}
                      </Text>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      style={styles.input}
                      placeholderTextColor="#999"
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#667eea" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsTitle}>Exigences du mot de passe:</Text>
                    <View style={styles.requirementItem}>
                      <Ionicons 
                        name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={16} 
                        color={password.length >= 8 ? '#4caf50' : 'rgba(255, 255, 255, 0.5)'} 
                      />
                      <Text style={styles.requirementText}>Au moins 8 caractères</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons 
                        name={/[A-Z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={16} 
                        color={/[A-Z]/.test(password) ? '#4caf50' : 'rgba(255, 255, 255, 0.5)'} 
                      />
                      <Text style={styles.requirementText}>Une majuscule</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons 
                        name={/[a-z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={16} 
                        color={/[a-z]/.test(password) ? '#4caf50' : 'rgba(255, 255, 255, 0.5)'} 
                      />
                      <Text style={styles.requirementText}>Une minuscule</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons 
                        name={/\d/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={16} 
                        color={/\d/.test(password) ? '#4caf50' : 'rgba(255, 255, 255, 0.5)'} 
                      />
                      <Text style={styles.requirementText}>Un chiffre</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={handleResetPassword}
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                  >
                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Réinitialiser</Text>
                          <Ionicons name="checkmark" size={20} color="white" style={styles.buttonIcon} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Success Message
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                <Text style={styles.successTitle}>Mot de passe réinitialisé!</Text>
                <Text style={styles.successText}>
                  Votre mot de passe a été mis à jour avec succès.
                </Text>
                <Text style={styles.successSubtext}>
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </Text>

                <TouchableOpacity 
                  onPress={handleBackToLogin}
                  style={styles.button}
                >
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>Se connecter</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
  eyeIcon: {
    padding: 5,
  },
  passwordStrengthContainer: {
    gap: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
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
  successContainer: {
    alignItems: 'center',
    gap: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  successSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResetPassword;