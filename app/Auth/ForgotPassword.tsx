import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/themehook';

const ForgotPassword = () => {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const BG       = colors.primary + '15';
  const BTN      = colors.primary + '80';
  const TEXT     = colors.text;
  const GRAY     = colors.input.placeholder;
  const INPUT_BG = colors.surfaceVariant;
  const BORDER   = colors.input.border;
  const PRIMARY  = colors.primary;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    await handleSendResetEmail();
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

          {!emailSent ? (
            <>
              {/* Header */}
              <Ionicons name="key-outline" size={56} color={BTN} style={styles.icon} />
              <Text style={[styles.title, { color: TEXT }]}>Mot de passe oublié</Text>
              <Text style={[styles.subtitle, { color: GRAY }]}>
                Entrez votre email pour recevoir un lien de réinitialisation
              </Text>

              {/* Email input */}
              <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
                <Ionicons name="mail-outline" size={18} color={GRAY} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.inputField, { color: TEXT }]}
                  placeholder="Adresse email"
                  placeholderTextColor={GRAY}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Help text */}
              <View style={[styles.helpBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
                <Ionicons name="information-circle-outline" size={16} color={GRAY} />
                <Text style={[styles.helpText, { color: GRAY }]}>
                  Vous recevrez un email avec les instructions pour réinitialiser votre mot de passe
                </Text>
              </View>

              {/* Send button */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: BTN }, loading && { opacity: 0.7 }]}
                onPress={handleSendResetEmail}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Envoyer le lien</Text>
                    <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success */}
              <Ionicons name="checkmark-circle" size={72} color={PRIMARY} style={styles.icon} />
              <Text style={[styles.title, { color: TEXT }]}>Email envoyé !</Text>
              <Text style={[styles.subtitle, { color: GRAY }]}>
                Nous avons envoyé un lien de réinitialisation à :
              </Text>
              <View style={[styles.emailBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
                <Text style={[styles.emailText, { color: TEXT }]}>{email}</Text>
              </View>

              {/* Instructions */}
              <View style={[styles.instructionsBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
                <Text style={[styles.instructionsTitle, { color: TEXT }]}>Étapes suivantes :</Text>
                {[
                  'Vérifiez votre boîte email',
                  'Cliquez sur le lien reçu',
                  'Créez un nouveau mot de passe',
                ].map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepBadge, { backgroundColor: BTN }]}>
                      <Text style={styles.stepNumber}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: TEXT }]}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Resend */}
              <TouchableOpacity onPress={handleResendEmail} disabled={loading} style={styles.resendBtn}>
                {loading
                  ? <ActivityIndicator size="small" color={PRIMARY} />
                  : <Text style={[styles.resendText, { color: PRIMARY }]}>Renvoyer l'email</Text>
                }
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 28,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
    borderWidth: 1,
    width: '100%',
  },
  inputField: {
    flex: 1,
    fontSize: 15,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    width: '100%',
    marginBottom: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  btn: {
    flexDirection: 'row',
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emailBox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  instructionsBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  resendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ForgotPassword;
