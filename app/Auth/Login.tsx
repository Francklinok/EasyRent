import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.66:3000/api/v1/auth'; // Change pour ton IP locale

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const token = data.data?.accessToken;
      const user = data.data?.user;

      if (!token || !user) {
        alert('Données de connexion invalides reçues');
        return;
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      router.replace('/(tabs)');
    } else {
      alert(data.message || 'Erreur de connexion');
    }
  } catch (error) {
    console.log('Erreur fetch/login:', error);
    alert('Erreur réseau');
  }
};


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <LinearGradient colors={['#63A4FF', '#4A90E2']} className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
          <Text className="text-3xl font-bold text-center mb-6 text-[#4A90E2]">Connexion</Text>
          
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
          
          <TouchableOpacity onPress={handleLogin} className="bg-[#4A90E2] py-4 rounded-full">
            <Text className="text-white text-center font-bold text-lg">Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/Auth/Register')} className="mt-4">
            <Text className="text-center text-[#4A90E2]">Pas de compte ? Inscrivez-vous</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
