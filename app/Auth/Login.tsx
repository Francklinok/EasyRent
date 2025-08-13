import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const router = useRouter();
  const { login, verifyTwoFactor, requiresTwoFactor, forgotPassword } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      }
      // If requiresTwoFactor is true, the UI will show 2FA input
    } catch (error) {
      console.error('Login error:', error);
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
      await verifyTwoFactor(twoFactorCode);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('2FA verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Email requis', 'Veuillez entrer votre email d\'abord');
      return;
    }

    try {
      await forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <LinearGradient colors={['#63A4FF', '#4A90E2']} className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
          <Text className="text-3xl font-bold text-center mb-6 text-[#4A90E2]">Connexion</Text>
          
          {requiresTwoFactor ? (
            // 2FA Input
            <>
              <Text className="text-center mb-4 text-gray-600">Entrez votre code d'authentification à deux facteurs</Text>
              <TextInput
                placeholder="Code 2FA"
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                keyboardType="numeric"
                className="border border-gray-300 p-3 rounded-lg mb-6 text-center text-lg"
                maxLength={6}
              />
              <TouchableOpacity 
                onPress={handleTwoFactorVerify} 
                className="bg-[#4A90E2] py-4 rounded-full"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Vérifier</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Login Form
            <>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 p-3 rounded-lg mb-4"
              />
              
              <View className="relative mb-4">
                <TextInput
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="border border-gray-300 p-3 rounded-lg pr-12"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity onPress={handleForgotPassword} className="mb-6">
                <Text className="text-right text-[#4A90E2]">Mot de passe oublié ?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleLogin} 
                className="bg-[#4A90E2] py-4 rounded-full"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Se connecter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/Auth/Register')} className="mt-4">
                <Text className="text-center text-[#4A90E2]">Pas de compte ? Inscrivez-vous</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
