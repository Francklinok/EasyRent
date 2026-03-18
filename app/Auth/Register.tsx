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
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/restApiService/authService';
import { Ionicons, AntDesign, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AuthSession from 'expo-auth-session';
import { useThemeColors } from '@/hooks/themehook';


WebBrowser.maybeCompleteAuthSession();

// ── OAuth config ──────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_GOOGLE_ANDROID_CLIENT_ID';
const GOOGLE_CLIENT_ID_IOS     = 'YOUR_GOOGLE_IOS_CLIENT_ID';
const GOOGLE_CLIENT_ID_WEB     = 'YOUR_GOOGLE_WEB_CLIENT_ID';
const FACEBOOK_APP_ID          = 'YOUR_FACEBOOK_APP_ID';

interface RegisterData {
  firstName:       string;
  lastName:        string;
  email:           string;
  phoneNumber:     string;
  password:        string;
  confirmPassword: string;
}

const RegisterScreen: React.FC = () => {
  const colors = useThemeColors();

  const [formData, setFormData] = useState<RegisterData>({
    firstName:       '',
    lastName:        '',
    email:           '',
    phoneNumber:     '',
    password:        '',
    confirmPassword: '',
  });
  const [rememberMe, setRememberMe]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'facebook' | null>(null);

  const router = useRouter();
  const update = (field: keyof RegisterData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId:     GOOGLE_CLIENT_ID_IOS,
    webClientId:     GOOGLE_CLIENT_ID_WEB,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleSocialToken('google', googleResponse.authentication?.accessToken);
    }
  }, [googleResponse]);

  // ── Facebook OAuth ──────────────────────────────────────────────────────────
  const [, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });

  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      handleSocialToken('facebook', fbResponse.authentication?.accessToken);
    }
  }, [fbResponse]);

  // ── Apple OAuth ─────────────────────────────────────────────────────────────
  const [, appleResponse, promptAppleAsync] = AuthSession.useAuthRequest(
    {
      clientId:     'YOUR_APPLE_SERVICE_ID',
      scopes:       ['name', 'email'],
      redirectUri:  AuthSession.makeRedirectUri({ scheme: 'myapp' }),
      responseType: AuthSession.ResponseType.Code,
      extraParams:  { response_mode: 'form_post' },
    },
    { authorizationEndpoint: 'https://appleid.apple.com/auth/authorize' }
  );

  React.useEffect(() => {
    if (appleResponse?.type === 'success') {
      handleSocialToken('apple', appleResponse.params.code);
    }
  }, [appleResponse]);

  const handleSocialToken = (provider: string, token?: string) => {
    setSocialLoading(null);
    if (!token) { Alert.alert('Erreur', `Connexion ${provider} annulée`); return; }
    // TODO: POST /api/v1/auth/social { provider, token }
    Alert.alert(`${provider} connecté`, 'Intégrez votre endpoint backend pour finaliser.');
  };

  const handleGoogleSignup   = async () => { setSocialLoading('google');   await promptGoogleAsync();   setSocialLoading(null); };
  const handleAppleSignup    = async () => { setSocialLoading('apple');    await promptAppleAsync();    setSocialLoading(null); };
  const handleFacebookSignup = async () => { setSocialLoading('facebook'); await promptFacebookAsync(); setSocialLoading(null); };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName.trim()) { Alert.alert('Erreur', 'Le prénom est obligatoire'); return false; }
    if (!lastName.trim())  { Alert.alert('Erreur', 'Le nom est obligatoire'); return false; }
    if (!email.trim())     { Alert.alert('Erreur', "L'email est obligatoire"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { Alert.alert('Erreur', 'Email invalide'); return false; }
    if (!password || password.length < 8) { Alert.alert('Erreur', 'Mot de passe minimum 8 caractères'); return false; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir minuscule, majuscule, chiffre et caractère spécial');
      return false;
    }
    if (password !== confirmPassword) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return false; }
    return true;
  };

  // ── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (loading || !validate()) return;
    setLoading(true);
    try {
      const firstName = formData.firstName.trim();
      const lastName  = formData.lastName.trim();
      const username  = firstName.toLowerCase() + Math.floor(Math.random() * 1000);

      await authService.register({
        username,
        email:    formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName,
        lastName,
        ...(formData.phoneNumber ? { phoneNumber: formData.phoneNumber } : {}),
      });

      router.push({ pathname: '/Auth/VerifyEmail', params: { email: formData.email.toLowerCase().trim() } });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Couleurs dérivées du thème
  const BG         =  colors.primary + "15";         
  const BTN        = colors.primary + "80";     
  const TEXT       = colors.text;
  const GRAY       = colors.input.placeholder;
  const INPUT_BG   = colors.input.background;
  const BORDER     = colors.input.border;
  const LINK_COLOR = colors.primary;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG, paddingBottom : 10 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[styles.title, { color: TEXT }]}>Sign up</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>Hey, Enter your details to sign up{'\n'}your account</Text>

          {/* First name + Last name */}
          <View style={styles.nameRow}>
            <View style={[styles.inputWrap, styles.nameField, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
              <Ionicons name="person-outline" size={18} color={GRAY} style={styles.icon} />
              <TextInput
                style={[styles.inputField, { color: TEXT }]}
                placeholder="Prénom"
                placeholderTextColor={GRAY}
                value={formData.firstName}
                onChangeText={v => update('firstName', v)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            <View style={[styles.inputWrap, styles.nameField, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
              <TextInput
                style={[styles.inputField, { color: TEXT }]}
                placeholder="Nom"
                placeholderTextColor={GRAY}
                value={formData.lastName}
                onChangeText={v => update('lastName', v)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="demo@gmail.com"
              placeholderTextColor={GRAY}
              value={formData.email}
              onChangeText={v => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Phone */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="call-outline" size={18} color={GRAY} style={styles.icon} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Phone Number"
              placeholderTextColor={GRAY}
              value={formData.phoneNumber}
              onChangeText={v => update('phoneNumber', v)}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="key-outline" size={18} color={GRAY} style={styles.icon} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Password"
              placeholderTextColor={GRAY}
              value={formData.password}
              onChangeText={v => update('password', v)}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* Confirm password */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="key-outline" size={18} color={GRAY} style={styles.icon} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Confirm Password"
              placeholderTextColor={GRAY}
              value={formData.confirmPassword}
              onChangeText={v => update('confirmPassword', v)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Remember me */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(v => !v)}>
            <View style={[styles.checkbox, { borderColor: GRAY }, rememberMe && { backgroundColor: BTN, borderColor: BTN }]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.rememberText, { color: TEXT }]}>Remember me</Text>
          </TouchableOpacity>

          {/* Create account button */}
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: BTN, shadowColor: BTN }, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.createBtnText}>Create An Account</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
            <Text style={[styles.dividerText, { color: GRAY }]}>Or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
          </View>

          {/* Social icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]} onPress={handleGoogleSignup} disabled={!!socialLoading} activeOpacity={0.8}>
              {socialLoading === 'google'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <AntDesign name="google" size={22} color="#EA4335" />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]} onPress={handleAppleSignup} disabled={!!socialLoading} activeOpacity={0.8}>
              {socialLoading === 'apple'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <MaterialCommunityIcons name="apple" size={24} color={TEXT} />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]} onPress={handleFacebookSignup} disabled={!!socialLoading} activeOpacity={0.8}>
              {socialLoading === 'facebook'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <FontAwesome name="facebook" size={22} color="#1877F2" />}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: GRAY }]}>Already Have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/Auth/Login')}>
              <Text style={[styles.loginLink, { color: LINK_COLOR }]}>Sign In</Text>
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
    paddingTop: 42,
    paddingBottom: 60,
  },

  // ── Typography ──────────────────────────────────────────────────────────────
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
    marginBottom: 22,
  },

  // ── Name row ────────────────────────────────────────────────────────────────
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  nameField: {
    flex: 1,
    marginBottom: 10,
  },

  // ── Inputs ──────────────────────────────────────────────────────────────────
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 10,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
  },

  // ── Remember me ─────────────────────────────────────────────────────────────
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 13,
  },

  // ── Create button ────────────────────────────────────────────────────────────
  createBtn: {
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
  },

  // ── Social ───────────────────────────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  socialCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── Login link ───────────────────────────────────────────────────────────────
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default RegisterScreen;
