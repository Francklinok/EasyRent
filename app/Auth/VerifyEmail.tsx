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
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/restApiService/authService';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/themehook';

const VerifyEmail = () => {
  const colors = useThemeColors();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const BG       = colors.primary + '15';
  const BTN      = colors.primary + '80';
  const TEXT     = colors.text;
  const GRAY     = colors.input.placeholder;
  const INPUT_BG = colors.surfaceVariant;
  const BORDER   = colors.input.border;
  const PRIMARY  = colors.primary;

  useEffect(() => {
    if (!email) {
      Alert.alert('Erreur', 'Email manquant pour la vérification.', [
        { text: 'OK', onPress: () => router.replace('/Auth/Register') },
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
          params: { email: email || '' },
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
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </TouchableOpacity>

          {/* Header */}
          <Ionicons name="mail-outline" size={56} color={BTN} style={styles.icon} />
          <Text style={[styles.title, { color: TEXT }]}>Vérifiez votre email</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>
            Nous avons envoyé un code de vérification à
          </Text>
          <View style={[styles.emailBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Text style={[styles.emailText, { color: TEXT }]}>{email}</Text>
          </View>

          {/* Code input */}
          <Text style={[styles.codeLabel, { color: GRAY }]}>Entrez le code à 6 chiffres</Text>
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <TextInput
              value={verificationCode}
              onChangeText={formatCode}
              keyboardType="numeric"
              style={[styles.codeInput, { color: TEXT }]}
              maxLength={6}
              placeholder="------"
              placeholderTextColor={GRAY}
              textAlign="center"
              editable={!loading}
            />
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: BTN },
              (loading || verificationCode.length !== 6) && { opacity: 0.5 },
            ]}
            onPress={handleVerifyCode}
            disabled={loading || verificationCode.length !== 6}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Vérifier</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: GRAY }]}>Vous n'avez pas reçu le code ? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={PRIMARY} />
              ) : (
                <Text style={[styles.resendLink, { color: PRIMARY }]}>Renvoyer</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 32,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  emailBox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginBottom: 22,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  inputWrap: {
    borderRadius: 12,
    height: 54,
    marginBottom: 28,
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 10,
    textAlign: 'center',
  },
  btn: {
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 28,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default VerifyEmail;
