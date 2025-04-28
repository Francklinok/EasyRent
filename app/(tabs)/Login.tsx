import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Récupérer l'utilisateur enregistré
      const storedUserJson = await AsyncStorage.getItem('user');
      
      if (storedUserJson) {
        const storedUser: User = JSON.parse(storedUserJson);
        
        if (storedUser.email === email && storedUser.password === password) {
          // Connexion réussie
          await AsyncStorage.setItem('isLoggedIn', 'true');
          router.replace('/home/home'); // Redirection vers l'écran principal
        } else {
          alert('Email ou mot de passe incorrect');
        }
      } else {
        alert('Aucun compte trouvé. Veuillez vous inscrire.');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#63A4FF', '#4A90E2']}
        className="flex-1 items-center justify-center p-6"
      >
        <View className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
          <Text className="text-3xl font-bold text-center mb-6 text-[#4A90E2]">
            Connexion
          </Text>
          
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
            onPress={handleLogin}
            className="bg-[#4A90E2] py-4 rounded-full"
          >
            <Text className="text-white text-center font-bold text-lg">
              Se connecter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
          onPress={() => router.push("/Auth/Register.")}
            className="mt-4"
          >
            <Text className="text-center text-[#4A90E2]">
              Pas de compte ? Inscrivez-vous
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default  LoginScreen