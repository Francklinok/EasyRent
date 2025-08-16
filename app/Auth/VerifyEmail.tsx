import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/components/services/authService';
import { Ionicons } from '@expo/vector-icons';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  useEffect(() => {
    if (!email) {
      Alert.alert('Erreur', 'Email manquant pour la vérification.', [
        { text: 'OK', onPress: () => router.replace('/Auth/Register') }
      ]);
    }
  }, [email]);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Code invalide', 'Veuillez entrer un code à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyAccount(email!, verificationCode);
      if (result.success || result.autoLogin) {
        router.push({
          pathname: '/Auth/PhotoUpload',
          params: { email: email || '' }
        });
      } else {
        Alert.alert('Erreur', result.message || 'Code invalide');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Vérification échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification(email!);
      Alert.alert('Code renvoyé', 'Nouveau code envoyé');
      setVerificationCode('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de renvoyer le code');
    } finally {
      setResendLoading(false);
    }
  };

  const formatCode = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(cleaned);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#25D366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérifier le numéro</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={80} color="#25D366" />
        </View>

        <Text style={styles.title}>Vérifiez votre email</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un SMS avec un code de vérification au numéro
        </Text>
        <Text style={styles.phoneNumber}>{email}</Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Entrez le code à 6 chiffres</Text>
          <TextInput
            value={verificationCode}
            onChangeText={formatCode}
            keyboardType="numeric"
            style={styles.codeInput}
            maxLength={6}
            placeholder="------"
            placeholderTextColor="#ccc"
            textAlign="center"
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          onPress={handleVerifyCode}
          style={[styles.verifyButton, (loading || verificationCode.length !== 6) && styles.buttonDisabled]}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Vérifier</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Vous n'avez pas reçu le code ? </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={resendLoading}>
            {resendLoading ? (
              <ActivityIndicator size="small" color="#25D366" />
            ) : (
              <Text style={styles.resendLink}>Renvoyer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#25D366',
    textAlign: 'center',
    marginBottom: 40,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInput: {
    width: 200,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#25D366',
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '600',
  },
});

export default VerifyEmail;