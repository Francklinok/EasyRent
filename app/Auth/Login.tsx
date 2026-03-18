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
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons, AntDesign, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { clearAllAuthDataManually } from '@/components/utils/clearAuthManually';
import { debugAllAuthData } from '@/components/utils/clearAuthManually';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useThemeColors } from '@/hooks/themehook';

WebBrowser.maybeCompleteAuthSession();

// ── OAuth config ─────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_GOOGLE_ANDROID_CLIENT_ID';
const GOOGLE_CLIENT_ID_IOS     = 'YOUR_GOOGLE_IOS_CLIENT_ID';
const GOOGLE_CLIENT_ID_WEB     = 'YOUR_GOOGLE_WEB_CLIENT_ID';
const FACEBOOK_APP_ID          = 'YOUR_FACEBOOK_APP_ID';

const LoginScreen = () => {
  const colors = useThemeColors();

  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [rememberMe, setRememberMe]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'facebook' | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const router = useRouter();
  const { login, verifyTwoFactor, requiresTwoFactor } = useAuth();

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId:     GOOGLE_CLIENT_ID_IOS,
    webClientId:     GOOGLE_CLIENT_ID_WEB,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleSocialToken('google', authentication?.accessToken);
    }
  }, [googleResponse]);

  // ── Facebook OAuth ─────────────────────────────────────────────────────────
  const [fbRequest, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });

  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleSocialToken('facebook', authentication?.accessToken);
    }
  }, [fbResponse]);

  // ── Apple OAuth ────────────────────────────────────────────────────────────
  const appleRedirectUri = AuthSession.makeRedirectUri({ scheme: 'myapp' });
  const [appleRequest, appleResponse, promptAppleAsync] = AuthSession.useAuthRequest(
    {
      clientId:    'YOUR_APPLE_SERVICE_ID',
      scopes:      ['name', 'email'],
      redirectUri: appleRedirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: { response_mode: 'form_post' },
    },
    { authorizationEndpoint: 'https://appleid.apple.com/auth/authorize' }
  );

  React.useEffect(() => {
    if (appleResponse?.type === 'success') {
      const { code } = appleResponse.params;
      handleSocialToken('apple', code);
    }
  }, [appleResponse]);

  // ── Social token → backend ─────────────────────────────────────────────────
  const handleSocialToken = async (provider: string, token?: string) => {
    if (!token) {
      Alert.alert('Erreur', `Connexion ${provider} annulée`);
      return;
    }
    setSocialLoading(null);
    // TODO: POST /api/v1/auth/social { provider, token }
    Alert.alert(
      `${provider} connecté`,
      `Token reçu. Intégrez votre endpoint backend pour finaliser la connexion.`
    );
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try { await promptGoogleAsync(); }
    catch { Alert.alert('Erreur', 'Connexion Google échouée'); }
    finally { setSocialLoading(null); }
  };

  const handleAppleLogin = async () => {
    setSocialLoading('apple');
    try { await promptAppleAsync(); }
    catch { Alert.alert('Erreur', 'Connexion Apple échouée'); }
    finally { setSocialLoading(null); }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    try { await promptFacebookAsync(); }
    catch { Alert.alert('Erreur', 'Connexion Facebook échouée'); }
    finally { setSocialLoading(null); }
  };

  // ── Email/password login ───────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await debugAllAuthData();
      const result = await login(email, password);
      if (result.success) {
        if (result.requireTwoFactor) {
          Alert.alert('Vérification', 'Veuillez entrer votre code 2FA');
        } else {
          router.replace('/Auth/AuthHome');
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Trop de requêtes')) {
        Alert.alert('Trop de tentatives', 'Veuillez patienter avant de réessayer.', [
          { text: 'Compris' },
          { text: 'Mot de passe oublié ?', onPress: () => router.push('/Auth/ForgotPassword') },
        ]);
      } else {
        Alert.alert('Erreur', error.message || 'Connexion échouée');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!twoFactorCode) { Alert.alert('Erreur', 'Entrez le code 2FA'); return; }
    setLoading(true);
    try {
      const result = await verifyTwoFactor(twoFactorCode);
      if (result.success) router.replace('/Auth/AuthHome');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Vérification échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert('Nettoyer le cache', 'Supprimer toutes les données d\'authentification ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Nettoyer', style: 'destructive',
        onPress: async () => {
          try { await clearAllAuthDataManually(); Alert.alert('Succès', 'Cache nettoyé.'); }
          catch { Alert.alert('Erreur', 'Impossible de nettoyer le cache'); }
        },
      },
    ]);
  };

  // Couleurs dérivées du thème
  const BG         = colors.primary + "15";
  const BTN        = colors.primary + "80";
  const TEXT       = colors.text;
  const GRAY       = colors.input.placeholder;
  const INPUT_BG   = colors.surfaceVariant;
  const BORDER     = colors.input.border;
  const LINK_COLOR = colors.primary;

  // ── 2FA screen ─────────────────────────────────────────────────────────────
  if (requiresTwoFactor) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
        <View style={styles.twoFaWrap}>
          <Ionicons name="shield-checkmark" size={60} color={BTN} style={{ marginBottom: 16 }} />
          <Text style={[styles.title, { color: TEXT }]}>Authentification 2FA</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>Entrez le code de vérification</Text>
          <TextInput
            style={[styles.input, { backgroundColor: INPUT_BG, borderColor: BORDER, color: TEXT, textAlign: 'center', letterSpacing: 8, fontSize: 22 }]}
            placeholder="000000"
            placeholderTextColor={GRAY}
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: BTN }, loading && { opacity: 0.7 }]} onPress={handleTwoFactorVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Vérifier</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[styles.title, { color: TEXT }]}>Login</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>Hey, Enter your details to get log in{'\n'}to your account</Text>

          {/* Email */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="demo@gmail.com"
              placeholderTextColor={GRAY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
            <Ionicons name="key-outline" size={18} color={GRAY} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.inputField, { color: TEXT }]}
              placeholder="Password"
              placeholderTextColor={GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* Remember me + Forget Password */}
          <View style={styles.rememberRow}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(v => !v)}>
              <View style={[styles.checkbox, { borderColor: GRAY }, rememberMe && { backgroundColor: BTN, borderColor: BTN }]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[styles.rememberText, { color: TEXT }]}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Auth/ForgotPassword')}>
              <Text style={[styles.forgotText, { color: TEXT }]}>Forget Password</Text>
            </TouchableOpacity>
          </View>

          {/* Log in button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: BTN  }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Log in</Text>}
          </TouchableOpacity>

          {/* Or continue with */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
            <Text style={[styles.dividerText, { color: GRAY }]}>Or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
          </View>

          {/* Social icons row */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]}
              onPress={handleGoogleLogin}
              disabled={!!socialLoading}
              activeOpacity={0.8}
            >
              {socialLoading === 'google'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <AntDesign name="google" size={22} color="#EA4335" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]}
              onPress={handleAppleLogin}
              disabled={!!socialLoading}
              activeOpacity={0.8}
            >
              {socialLoading === 'apple'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <MaterialCommunityIcons name="apple" size={24} color={TEXT} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: INPUT_BG, borderColor: BORDER }]}
              onPress={handleFacebookLogin}
              disabled={!!socialLoading}
              activeOpacity={0.8}
            >
              {socialLoading === 'facebook'
                ? <ActivityIndicator size="small" color={GRAY} />
                : <FontAwesome name="facebook" size={22} color="#1877F2" />}
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={[styles.signupText, { color: GRAY }]}>Don't Have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/Auth/Register')}>
              <Text style={[styles.signupLink, { color: LINK_COLOR }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Cache (discret) */}
          <TouchableOpacity onPress={handleClearCache} style={styles.cacheBtn}>
            <Text style={[styles.cacheBtnText, { color: GRAY }]}>🧹 Nettoyer le cache</Text>
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
  },

  // ── Typography ─────────────────────────────────────────────────────────────
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
    marginBottom: 32,
  },

  // ── Inputs ─────────────────────────────────────────────────────────────────
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 14,
    borderWidth: 1,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 15,
    borderWidth: 1,
    width: '100%',
    marginBottom: 16,
  },

  // ── Remember / Forgot ──────────────────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Login button ───────────────────────────────────────────────────────────
  loginBtn: {
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
  },

  // ── Social ─────────────────────────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
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
    elevation: 2,
  },

  // ── Sign up ────────────────────────────────────────────────────────────────
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft:10
  },

  // ── Cache ──────────────────────────────────────────────────────────────────
  cacheBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cacheBtnText: {
    fontSize: 12,
  },

  // ── 2FA ───────────────────────────────────────────────────────────────────
  twoFaWrap: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;
