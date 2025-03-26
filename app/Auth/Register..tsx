
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Écran d'inscription
const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Simuler un enregistrement
      const newUser: User = { email, password, username };
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // Redirection vers l'écran de connexion
      router.push("/Auth/Login");
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    }
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
              placeholder="Nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              className="border border-gray-300 p-3 rounded-lg mb-4"
            />
            
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              className="border border-gray-300 p-3 rounded-lg mb-4"
            />
            
            <TextInput
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 p-3 rounded-lg mb-6"
            />
            
            <TouchableOpacity 
              onPress={handleRegister}
              className="bg-[#4A90E2] py-4 rounded-full"
            >
              <Text className="text-white text-center font-bold text-lg">
                S'inscrire
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push("/Auth/Login")}
              className="mt-4"
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