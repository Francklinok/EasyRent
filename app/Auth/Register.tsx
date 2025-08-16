import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { authService } from '@/components/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 600, 
        useNativeDriver: true 
      })
    ]).start();

    return () => StatusBar.setBarStyle('default');
  }, []);

  const validateForm = (): boolean => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Erreur', 'Email invalide');
      return false;
    }
    if (!password || password.length < 8) {
      Alert.alert('Erreur', 'Mot de passe minimum 8 caractères');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&)');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (loading || !validateForm()) return;

    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      const username = firstName.toLowerCase() + Math.floor(Math.random() * 1000);

      const registerData = {
        username,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName,
        lastName,
        ...(formData.phoneNumber ? { phoneNumber: formData.phoneNumber } : {})
      };

      const result = await authService.register(registerData);
      console.log('Registration result:', result);
      
      // Navigate directly to verification page on successful registration
      router.push({
        pathname: '/Auth/VerifyEmail',
        params: { email: registerData.email }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Erreur', error.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient 
          colors={['#667eea', '#764ba2']} 
          style={styles.gradient}
        >
          <Animated.View style={[styles.formContainer, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <BlurView intensity={20} style={styles.blurContainer}>
              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-add" size={28} color="#f5576c" />
                </View>
                <Text style={styles.title}>Inscription</Text>
                <Text style={styles.subtitle}>Créez votre compte</Text>
              </View>

              {/* Form */}
              <View style={styles.formContent}>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color="#f5576c" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nom complet"
                    value={formData.fullName}
                    onChangeText={v => updateFormData('fullName', v)}
                    style={styles.input}
                    autoCapitalize="words"
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={18} color="#f5576c" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={v => updateFormData('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={18} color="#f5576c" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChangeText={v => updateFormData('password', v)}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={18} 
                      color="#f5576c" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={18} color="#f5576c" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirmer mot de passe"
                    value={formData.confirmPassword}
                    onChangeText={v => updateFormData('confirmPassword', v)}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={18} 
                      color="#f5576c" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={18} color="#f5576c" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Téléphone (optionnel)"
                    value={formData.phoneNumber}
                    onChangeText={v => updateFormData('phoneNumber', v)}
                    keyboardType="phone-pad"
                    style={styles.input}
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleRegister}
                  disabled={loading}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  <LinearGradient 
                    colors={['#f5576c', '#f093fb']} 
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>S'inscrire</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" style={styles.buttonIcon} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                onPress={() => router.push("/Auth/Login")} 
                style={styles.loginButton} 
                disabled={loading}
              >
                <Text style={styles.loginText}>Déjà un compte ? </Text>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 350 
  },
  blurContainer: { 
    borderRadius: 20, 
    padding: 25, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)'
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 25 
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 5
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)', 
    textAlign: 'center'
  },
  formContent: { 
    gap: 15 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 50
  },
  inputIcon: {
    marginRight: 10
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#333'
  },
  eyeIcon: { 
    padding: 5
  },
  button: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginTop: 10
  },
  buttonDisabled: { 
    opacity: 0.7 
  },
  buttonGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 20 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  buttonIcon: { 
    marginLeft: 8 
  },
  divider: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: 'rgba(255,255,255,0.3)' 
  },
  dividerText: { 
    color: 'rgba(255,255,255,0.7)', 
    marginHorizontal: 15, 
    fontSize: 12
  },
  loginButton: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  loginText: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 14 
  },
  loginLink: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: 'bold'
  },
});

export default RegisterScreen;