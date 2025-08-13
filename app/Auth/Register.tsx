import React, { useState } from 'react';
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
  Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const { register, verifyAccount, resendVerification } = useAuth();

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

      await register(registerData);
      setVerificationStep(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    try {
      await verifyAccount(formData.email, verificationCode);
      router.push('/Auth/Login');
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification(formData.email);
    } catch (error) {
      console.error('Resend verification error:', error);
    }
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    console.log(`📝 Mise à jour ${field}:`, value);
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
          colors={['#63A4FF', '#4A90E2']}
          style={styles.gradient}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Inscription</Text>
            
            {verificationStep ? (
              // Verification Step
              <>
                <Text style={styles.verificationText}>
                  Un code de vérification a été envoyé à {formData.email}
                </Text>
                
                <TextInput
                  placeholder="Code de vérification"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={6}
                  editable={!loading}
                />
                
                <TouchableOpacity 
                  onPress={handleVerifyAccount}
                  disabled={loading}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Vérifier le compte</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleResendVerification}
                  style={{ marginTop: 16 }}
                >
                  <Text style={styles.linkText}>Renvoyer le code</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Registration Form
              <>
                <TextInput
                  placeholder="Nom complet"
                  value={formData.fullName}
                  onChangeText={(value) => updateFormData('fullName', value)}
                  style={styles.input}
                  autoCapitalize="words"
                  editable={!loading}
                />
                
                <TextInput
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!loading}
                />
                
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Numéro de téléphone (optionnel)"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  style={styles.input}
                  editable={!loading}
                />
                
                <TouchableOpacity 
                  onPress={handleRegister}
                  disabled={loading}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>S'inscrire</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {!verificationStep && (
              <TouchableOpacity 
                onPress={() => router.push("/Auth/Login")}
                style={{ marginTop: 16 }}
                disabled={loading}
              >
                <Text style={styles.linkText}>
                  Déjà un compte ? Connectez-vous
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 30,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linkText: {
    color: '#4A90E2',
    textAlign: 'center',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  verificationText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 14,
  }
});

export default RegisterScreen;