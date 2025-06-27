import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
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

  // Fonction pour valider les données du formulaire
  const validateForm = (): boolean => {
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
    if (!/^[a-z0-9_.-]+$/.test(formData.username.toLowerCase())) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et points');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return false;
    }
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
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
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Préparer les données à envoyer (sans les champs vides optionnels)
      const dataToSend: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      // Ajouter le numéro de téléphone s'il est fourni
      if (formData.phoneNumber?.trim()) {
        dataToSend.phoneNumber = formData.phoneNumber.trim();
      }

      // Appel à l'API (remplacez l'URL par votre endpoint)
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          'Inscription réussie',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => router.push('/Auth/Login')
            }
          ]
        );
      } else {
        Alert.alert('Erreur d\'inscription', result.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur. Veuillez réessayer.');
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
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={['#63A4FF', '#4A90E2']}
          className="flex-1 items-center justify-center p-6"
        >
          <View className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
            <Text className="text-3xl font-bold text-center mb-6 text-[#4A90E2]">
              Inscription
            </Text>
            
            <TextInput
              placeholder="Prénom"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              className="border border-gray-300 p-3 rounded-lg mb-4"
              autoCapitalize="words"
            />
            
            <TextInput
              placeholder="Nom"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              className="border border-gray-300 p-3 rounded-lg mb-4"
              autoCapitalize="words"
            />
            
            <TextInput
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              className="border border-gray-300 p-3 rounded-lg mb-4"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="border border-gray-300 p-3 rounded-lg mb-4"
            />
            
            <TextInput
              placeholder="Mot de passe"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              className="border border-gray-300 p-3 rounded-lg mb-4"
            />

            <TextInput
              placeholder="Numéro de téléphone (optionnel)"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
              className="border border-gray-300 p-3 rounded-lg mb-6"
            />
            
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              className={`py-4 rounded-full ${loading ? 'bg-gray-400' : 'bg-[#4A90E2]'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  S'inscrire
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push("/Auth/Login")}
              className="mt-4"
              disabled={loading}
            >
              <Text className="text-center text-[#4A90E2]">
                Déjà un compte ? Connectez-vous
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;