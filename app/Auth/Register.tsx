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

// Interface pour les données d'inscription
interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Interface pour la réponse de l'API
interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
  };
}

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    console.log('🔍 Validation du formulaire...', formData);
    
    if (!formData.firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      Alert.alert('Erreur', 'Le prénom doit contenir au moins 2 caractères');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères');
      return false;
    }
    if (!formData.username.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur est obligatoire');
      return false;
    }
    if (formData.username.trim().length < 3) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }
    if (!/^[a-z0-9_.-]+$/i.test(formData.username.trim())) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et points');
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
    
    console.log('✅ Validation réussie');
    return true;
  };

  const handleRegister = async () => {
    console.log('🚀 handleRegister déclenché');
    console.log('📝 Données du formulaire:', formData);
    
    // Vérifier si déjà en cours de traitement
    if (loading) {
      console.log('⏳ Déjà en cours de traitement, abandon');
      return;
    }

    if (!validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }

    setLoading(true);
    console.log('🔄 Loading activé');

    try {
      const dataToSend: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };
      
      if (formData.phoneNumber?.trim()) {
        dataToSend.phoneNumber = formData.phoneNumber.trim();
      }

      console.log('📤 Données à envoyer:', dataToSend);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout de la requête');
        controller.abort();
      }, 15000); // 15 sec timeout

      console.log('🌐 Envoi de la requête...');

      const response = await fetch('http://192.168.1.66:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Réponse reçue - Status:', response.status);
      console.log('📥 Réponse headers:', response.headers);

      let result: ApiResponse;
      try {
        result = await response.json();
        console.log('📄 Contenu de la réponse:', result);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse du serveur invalide');
      }

      if (response.ok && result.success) {
        console.log('✅ Inscription réussie');
        Alert.alert(
          'Inscription réussie', 
          result.message || 'Votre compte a été créé avec succès',
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('🔄 Redirection vers Login');
                router.push('/Auth/Login');
              }
            }
          ]
        );
      } else {
        console.log('❌ Erreur d\'inscription:', result);
        Alert.alert('Erreur d\'inscription', result.message || 'Une erreur est survenue');
      }
    } catch (error: any) {
      console.error('💥 Erreur lors de l\'inscription:', error);
      
      if (error.name === 'AbortError') {
        console.error('⏰ Request timed out');
        Alert.alert('Erreur', 'La requête a expiré. Veuillez réessayer.');
      } else if (error.message?.includes('Network request failed')) {
        console.error('🌐 Erreur réseau');
        Alert.alert('Erreur', 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        console.error('❌ Erreur générale:', error.message);
        Alert.alert('Erreur', error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      console.log('🔄 Loading désactivé');
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    console.log(`📝 Mise à jour ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction de test pour vérifier le bouton
  const testButton = () => {
    console.log('🧪 Test du bouton - Bouton pressé !');
    Alert.alert('Test', 'Le bouton fonctionne !');
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
            
            <TextInput
              placeholder="Prénom"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              style={styles.input}
              autoCapitalize="words"
              editable={!loading}
            />
            
            <TextInput
              placeholder="Nom"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              style={styles.input}
              autoCapitalize="words"
              editable={!loading}
            />
            
            <TextInput
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
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
            
            <TextInput
              placeholder="Mot de passe"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />

            <TextInput
              placeholder="Numéro de téléphone (optionnel)"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
              style={styles.input}
              editable={!loading}
            />
            
            {/* Bouton de test - Retirez après confirmation */}
            <TouchableOpacity 
              onPress={testButton}
              style={[styles.button, { backgroundColor: '#FF6B6B', marginBottom: 10 }]}
            >
              <Text style={styles.buttonText}>Test Bouton</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
              activeOpacity={0.7}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                    Inscription en cours...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                console.log('🔄 Redirection vers Login');
                router.push("/Auth/Login");
              }}
              style={{ marginTop: 16 }}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                Déjà un compte ? Connectez-vous
              </Text>
            </TouchableOpacity>
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
  }
});

export default RegisterScreen;