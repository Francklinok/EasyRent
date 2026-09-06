import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { Ionicons, AntDesign, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { clearAllAuthDataManually } from '@/components/utils/clearAuthManually';
import { debugAllAuthData } from '@/components/utils/clearAuthManually';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useThemeColors } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';

WebBrowser.maybeCompleteAuthSession();

// ── OAuth config ─────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_GOOGLE_ANDROID_CLIENT_ID';
const GOOGLE_CLIENT_ID_IOS     = 'YOUR_GOOGLE_IOS_CLIENT_ID';
const GOOGLE_CLIENT_ID_WEB     = 'YOUR_GOOGLE_WEB_CLIENT_ID';
const FACEBOOK_APP_ID          = 'YOUR_FACEBOOK_APP_ID';

const LoginScreen = () => {
  const colors = useThemeColors();
  const { t } = useLanguage();

  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [rememberMe, setRememberMe]       = useState(false);
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
    catch { Alert.alert('Erreur', t('auth.login.errGoogle')); }
    finally { setSocialLoading(null); }
  };

  const handleAppleLogin = async () => {
    setSocialLoading('apple');
    try { await promptAppleAsync(); }
    catch { Alert.alert('Erreur', t('auth.login.errApple')); }
    finally { setSocialLoading(null); }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    try { await promptFacebookAsync(); }
    catch { Alert.alert('Erreur', t('auth.login.errFacebook')); }
    finally { setSocialLoading(null); }
  };

  // ── Email/password login ───────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', t('auth.login.errEmpty'));
      return;
    }
    setLoading(true);
    try {
      await debugAllAuthData();
      const result = await login(email, password);
      if (result.success) {
        if (result.requireTwoFactor) {
          Alert.alert('Vérification', t('auth.login.need2fa'));
        } else {
          router.replace('/Auth/AuthHome');
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Trop de requêtes')) {
        Alert.alert(t('auth.login.errTooMany'), t('auth.login.errTooManyMsg'), [
          { text: t('auth.login.errTooManyOk') },
          { text: t('auth.login.errForgot'), onPress: () => router.push('/Auth/ForgotPassword') },
        ]);
      } else {
        Alert.alert('Erreur', error.message || 'Connexion échouée');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!twoFactorCode) { Alert.alert('Erreur', t('auth.login.errTwoFa')); return; }
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
    Alert.alert(t('auth.login.clearCacheTitle'), t('auth.login.clearCacheMsg'), [
      { text: t('auth.login.clearCacheCancel'), style: 'cancel' },
      {
        text: t('auth.login.clearCacheConfirm'), style: 'destructive',
        onPress: async () => {
          try { await clearAllAuthDataManually(); Alert.alert(t('auth.login.clearCacheSuccessTitle'), t('auth.login.clearCacheSuccess')); }
          catch { Alert.alert('Erreur', t('auth.login.clearCacheError')); }
        },
      },
    ]);
  };

  const TEXT       = colors.text;
  const GRAY       = colors.input.placeholder;
  const BORDER     = colors.input.border;
  const LINK_COLOR = colors.primary;

  // ── 2FA screen ─────────────────────────────────────────────────────────────
  if (requiresTwoFactor) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
          style={styles.twoFaWrap}
        >
          <View style={[styles.shieldCircle, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="shield-checkmark" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: TEXT }]}>{t('auth.login.twoFaTitle')}</Text>
          <Text style={[styles.subtitle, { color: GRAY }]}>{t('auth.login.twoFaSubtitle')}</Text>
          <AuthTextField
            label="000000"
            colors={colors}
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="numeric"
            maxLength={6}
            containerStyle={styles.twoFaInput}
          />
          <AuthPrimaryButton
            label={t('auth.login.twoFaVerify')}
            onPress={handleTwoFactorVerify}
            loading={loading}
            colors={colors}
          />
        </MotiView>
      </SafeAreaView>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            {/* Brand mark */}
            <View style={[styles.brandMark, { backgroundColor: colors.primary + '15' }]}>
              <MaterialCommunityIcons name="home-city" size={30} color={colors.primary} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: TEXT }]}>{t('auth.login.title')}</Text>
            <Text style={[styles.subtitle, { color: GRAY }]}>{t('auth.login.subtitle')}</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 80 }}
          >
            {/* Card grouping every form field — replaces the previous flat,
                ungrouped stack of pill inputs with a single visually
                bounded surface, the way most modern auth forms separate
                "the form" from the page chrome around it. */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.outline + '20',
                  shadowColor: colors.shadow?.color || '#000',
                },
              ]}
            >
              <AuthTextField
                label={t('auth.login.emailLabel') as string}
                colors={colors}
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ marginBottom: 14 }}
              />

              <AuthTextField
                label={t('auth.login.passwordLabel') as string}
                colors={colors}
                icon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={setPassword}
                containerStyle={{ marginBottom: 4 }}
              />

              {/* Remember me + Forget Password */}
              <View style={styles.rememberRow}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(v => !v)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, { borderColor: BORDER }, rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[styles.rememberText, { color: TEXT }]}>{t('auth.login.rememberMe')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/Auth/ForgotPassword')}>
                  <Text style={[styles.forgotText, { color: colors.primary }]}>{t('auth.login.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 140 }}
          >
            {/* Log in button */}
            <View style={{ marginTop: 22 }}>
              <AuthPrimaryButton
                label={t('auth.login.loginBtn') as string}
                onPress={handleLogin}
                loading={loading}
                colors={colors}
              />
            </View>

            {/* Or continue with */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
              <Text style={[styles.dividerText, { color: GRAY }]}>{t('auth.login.orContinueWith')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
            </View>

            {/* Social icons row */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: colors.surfaceVariant, borderColor: BORDER }]}
                onPress={handleGoogleLogin}
                disabled={!!socialLoading}
                activeOpacity={0.8}
              >
                {socialLoading === 'google'
                  ? <ActivityIndicator size="small" color={GRAY} />
                  : <AntDesign name="google" size={22} color="#EA4335" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: colors.surfaceVariant, borderColor: BORDER }]}
                onPress={handleAppleLogin}
                disabled={!!socialLoading}
                activeOpacity={0.8}
              >
                {socialLoading === 'apple'
                  ? <ActivityIndicator size="small" color={GRAY} />
                  : <MaterialCommunityIcons name="apple" size={24} color={TEXT} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: colors.surfaceVariant, borderColor: BORDER }]}
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
              <Text style={[styles.signupText, { color: GRAY }]}>{t('auth.login.noAccount')}</Text>
              <TouchableOpacity onPress={() => router.push('/Auth/Register')}>
                <Text style={[styles.signupLink, { color: LINK_COLOR }]}>{t('auth.login.signUp')}</Text>
              </TouchableOpacity>
            </View>

            {/* Cache (discret) */}
            <TouchableOpacity onPress={handleClearCache} style={styles.cacheBtn}>
              <Text style={[styles.cacheBtnText, { color: GRAY }]}>{'🧹 ' + t('auth.login.clearCache')}</Text>
            </TouchableOpacity>
          </MotiView>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── Brand ──────────────────────────────────────────────────────────────────
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // ── Typography ─────────────────────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },

  // ── Remember / Forgot ──────────────────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Social ─────────────────────────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  socialCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  // ── Sign up ────────────────────────────────────────────────────────────────
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },

  // ── Cache ──────────────────────────────────────────────────────────────────
  cacheBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cacheBtnText: {
    fontSize: 11,
  },

  // ── 2FA ───────────────────────────────────────────────────────────────────
  twoFaWrap: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  twoFaInput: {
    width: '100%',
    marginTop: 24,
    marginBottom: 20,
  },
});

export default LoginScreen;
