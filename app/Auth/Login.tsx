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
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const router = useRouter();
  const { login, verifyTwoFactor, requiresTwoFactor, forgotPassword } = useAuth();
  
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

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
    return;
  }

  setLoading(true);
  try {
    const result = await login(email, password);
    console.log('Login result:', result);

    if (result.success) {
      if (result.requireTwoFactor) {
        // 2FA activé, on attend le code
        Alert.alert('Vérification', 'Veuillez entrer votre code 2FA');
      } else {
        // Login complet
        router.replace('/Auth/AuthHome');
      }
    }
  } catch (error: any) {
    console.error('Login error:', error);
    Alert.alert('Erreur', error.message || 'Connexion échouée');
  } finally {
    setLoading(false);
  }
};

const handleTwoFactorVerify = async () => {
  if (!twoFactorCode) {
    Alert.alert('Erreur', 'Veuillez entrer le code 2FA');
    return;
  }

  setLoading(true);
  try {
    const result = await verifyTwoFactor(twoFactorCode);
    if (result.success) {
      router.replace('/Auth/AuthHome');
    }
  } catch (error: any) {
    console.error('2FA verification error:', error);
    Alert.alert('Erreur', error.message || 'Vérification échouée');
  } finally {
    setLoading(false);
  }
};


  const handleForgotPassword = () => {
    router.push('/Auth/ForgotPassword');
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gradient}>
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, { top: 100, left: 50, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { top: 200, right: 30, opacity: fadeAnim }]} />
          <Animated.View style={[styles.floatingCircle, { bottom: 150, left: 30, opacity: fadeAnim }]} />
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
              <Ionicons name="lock-closed" size={40} color="#667eea" />
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>Bienvenue ! Connectez-vous à votre compte</Text>
            </View>
            
            {requiresTwoFactor ? (
              <View style={styles.twoFactorContainer}>
                <Ionicons name="shield-checkmark" size={60} color="#667eea" style={styles.twoFactorIcon} />
                <Text style={styles.twoFactorTitle}>Authentification à deux facteurs</Text>
                <Text style={styles.twoFactorText}>Entrez le code de vérification</Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="000000"
                    value={twoFactorCode}
                    onChangeText={setTwoFactorCode}
                    keyboardType="numeric"
                    style={styles.twoFactorInput}
                    maxLength={6}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <TouchableOpacity 
                  onPress={handleTwoFactorVerify} 
                  style={[styles.button, loading && styles.buttonDisabled]}
                  disabled={loading}
                >
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Vérifier</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContent}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Adresse email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
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
                
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleLogin} 
                  style={[styles.button, loading && styles.buttonDisabled]}
                  disabled={loading}
                >
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Se connecter</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity onPress={() => router.push('/Auth/Register')} style={styles.registerButton}>
                  <Text style={styles.registerText}>Pas de compte ? </Text>
                  <Text style={styles.registerLink}>Inscrivez-vous</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
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
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  registerLink: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  twoFactorContainer: {
    alignItems: 'center',
    gap: 15,
  },
  twoFactorIcon: {
    marginBottom: 10,
  },
  twoFactorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  twoFactorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  twoFactorInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#333',
  },
});

export default LoginScreen;
