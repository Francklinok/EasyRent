import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { register, verifyAccount, resendVerification } = useAuth();
  
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

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire');
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Erreur', 'Veuillez fournir un email valide');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Erreur', 'Le mot de passe est obligatoire');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (loading || !validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone?.trim()
      };

      const result = await register(registerData);
      if (result.success && result.verificationRequired) {
        router.push({
          pathname: '/Auth/VerifyEmail',
          params: { email: registerData.email }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };



  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#f093fb', '#f5576c', '#4facfe']}
          style={styles.gradient}
        >
          {/* Floating Elements */}
          <View style={styles.floatingElements}>
            <Animated.View style={[styles.floatingCircle, { top: 80, right: 40, opacity: fadeAnim }]} />
            <Animated.View style={[styles.floatingCircle, { top: 180, left: 20, opacity: fadeAnim }]} />
            <Animated.View style={[styles.floatingCircle, { bottom: 120, right: 60, opacity: fadeAnim }]} />
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
                <Ionicons name="person-add" size={40} color="#f5576c" />
                <Text style={styles.title}>Inscription</Text>
                <Text style={styles.subtitle}>Créez votre compte en quelques étapes</Text>
              </View>

                <View style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color="#f5576c" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nom complet"
                      value={formData.fullName}
                      onChangeText={(value) => updateFormData('fullName', value)}
                      style={styles.input}
                      autoCapitalize="words"
                      editable={!loading}
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={20} color="#f5576c" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Adresse email"
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                      editable={!loading}
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#f5576c" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
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
                        size={20} 
                        color="#f5576c" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#f5576c" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
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
                        size={20} 
                        color="#f5576c" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="call" size={20} color="#f5576c" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Téléphone (optionnel)"
                      value={formData.phone}
                      onChangeText={(value) => updateFormData('phone', value)}
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
                    <LinearGradient colors={['#f5576c', '#f093fb']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>S'inscrire</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
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
                <Text style={styles.loginLink}>Connectez-vous</Text>
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
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContent: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
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
  button: {
    borderRadius: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 15,
    fontSize: 12,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loginLink: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

});

export default RegisterScreen;