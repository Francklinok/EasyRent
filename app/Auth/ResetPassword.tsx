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
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/themehook';

const ResetPassword = () => {
  const colors = useThemeColors();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword } = useAuth();

  const BG       = colors.primary + '15';
  const BTN      = colors.primary + '80';
  const TEXT     = colors.text;
  const GRAY     = colors.input.placeholder;
  const INPUT_BG = colors.surfaceVariant;
  const BORDER   = colors.input.border;
  const PRIMARY  = colors.primary;

  useEffect(() => {
    if (!token) {
      Alert.alert('Lien invalide', 'Le lien de réinitialisation est invalide ou a expiré.', [
        { text: 'OK', onPress: () => router.replace('/Auth/Login') },
      ]);
    }
  }, [token]);

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers   = /\d/.test(pwd);
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      Alert.alert('Mot de passe faible', 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Mot de passe requis', 'Veuillez entrer un nouveau mot de passe');
      return;
    }
    if (!validatePassword(password)) return;
    if (password !== confirmPassword) {
      Alert.alert('Mots de passe différents', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (!token) {
      Alert.alert('Erreur', 'Token de réinitialisation manquant');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setResetSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { strength: number; text: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    const map: [string, string][] = [
      ['Très faible', '#f44336'],
      ['Très faible', '#f44336'],
      ['Faible', '#ff9800'],
      ['Moyen', '#ffeb3b'],
      ['Fort', '#8bc34a'],
      ['Très fort', '#4caf50'],
    ];
    const [text, color] = map[strength] ?? map[0];
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(password);

  const requirements = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Une minuscule', met: /[a-z]/.test(password) },
    { label: 'Un chiffre', met: /\d/.test(password) },
  ];

  if (resetSuccess) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color={PRIMARY} style={{ marginBottom: 20 }} />
          <Text style={[styles.title, { color: TEXT }]}>Mot de passe réinitialisé !</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>
            Votre mot de passe a été mis à jour avec succès.{'\n'}
            Vous pouvez maintenant vous connecter.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: BTN, marginTop: 32 }]}
            onPress={() => router.replace('/Auth/Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Se connecter</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Ionicons name="lock-open-outline" size={56} color={BTN} style={styles.icon} />
          <Text style={[styles.title, { color: TEXT }]}>Nouveau mot de passe</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>
            Créez un mot de passe sécurisé pour votre compte
          </Text>

          {/* New password */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="lock-closed-outline" size={18} color={GRAY} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* Strength bar */}
          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={[styles.strengthBar, { backgroundColor: BORDER }]}>
                <View
                  style={[
                    styles.strengthFill,
                    { width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.text}</Text>
            </View>
          )}

          {/* Confirm password */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="lock-closed-outline" size={18} color={GRAY} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={GRAY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* Requirements */}
          <View style={[styles.reqBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Text style={[styles.reqTitle, { color: TEXT }]}>Exigences du mot de passe :</Text>
            {requirements.map((r, i) => (
              <View key={i} style={styles.reqRow}>
                <Ionicons
                  name={r.met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={r.met ? PRIMARY : GRAY}
                />
                <Text style={[styles.reqText, { color: r.met ? TEXT : GRAY }]}>{r.label}</Text>
              </View>
            ))}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: BTN }, loading && { opacity: 0.7 }]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Réinitialiser</Text>
                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
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
    paddingTop: 52,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successWrap: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 14,
    borderWidth: 1,
    width: '100%',
  },
  inputField: {
    flex: 1,
    fontSize: 15,
  },
  strengthWrap: {
    width: '100%',
    gap: 6,
    marginBottom: 14,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  reqBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  reqTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: 13,
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
});

export default ResetPassword;
