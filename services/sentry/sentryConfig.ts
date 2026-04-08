import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const ENV = Constants.expoConfig?.extra?.env ?? process.env.NODE_ENV ?? 'development';
const RELEASE = Constants.expoConfig?.version
  ? `myapp@${Constants.expoConfig.version}`
  : 'myapp@1.0.0';

const SENTRY_DSN =
  Constants.expoConfig?.extra?.SENTRY_DSN ??
  process.env.EXPO_PUBLIC_SENTRY_DSN ??
  '';

/**
 * Initialise Sentry pour le frontend React Native (Expo).
 * Appeler cette fonction le plus tôt possible, avant le rendu de l'app.
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] EXPO_PUBLIC_SENTRY_DSN non défini – monitoring désactivé');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    release: RELEASE,
    dist: Constants.expoConfig?.runtimeVersion ?? '1',

    // Performance : 100% dev, 20% prod
    tracesSampleRate: ENV === 'production' ? 0.2 : 1.0,

    // Intégrations automatiques
    integrations: [
      // Capture automatique des erreurs JS non gérées
      Sentry.reactNativeTracingIntegration(),
    ],

    // Breadcrumbs automatiques
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,

    // Filtrer les données sensibles
    beforeSend(event, hint) {
      // Ne pas envoyer les erreurs de réseau en mode développement
      if (ENV === 'development') {
        const err = hint?.originalException;
        if (err instanceof Error && err.message?.includes('Network Error')) {
          return null;
        }
      }

      // Masquer le token dans les headers des breadcrumbs
      if (event.breadcrumbs?.values) {
        event.breadcrumbs.values = event.breadcrumbs.values.map((b) => {
          if (b.data?.['Authorization']) b.data['Authorization'] = '[Filtered]';
          if (b.data?.['token']) b.data['token'] = '[Filtered]';
          return b;
        });
      }

      return event;
    },

    // Tags globaux
    initialScope: {
      tags: {
        platform: Platform.OS,
        platformVersion: String(Platform.Version),
        appVersion: Constants.expoConfig?.version ?? '1.0.0',
      },
    },

    // Ignorer les erreurs connues non-critiques
    ignoreErrors: [
      'Non-Error exception captured',
      'Network request failed',
      'AbortError',
      'ResizeObserver loop limit exceeded',
    ],

    // Activer les traces natives (iOS/Android)
    enableNativeFramesTracking: true,
    enableStallTracking: true,
    enableAppStartTracking: true,
  });

  console.log(`[Sentry] Initialisé [env=${ENV}] [release=${RELEASE}]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identifier l'utilisateur courant dans Sentry (après login).
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  if (user.role) {
    Sentry.setTag('user.role', user.role);
  }
}

/**
 * Effacer l'utilisateur Sentry (après logout).
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Capturer une exception avec contexte enrichi.
 */
export function captureException(
  error: Error | unknown,
  context?: {
    userId?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
): void {
  Sentry.withScope((scope) => {
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.tags) {
      Object.entries(context.tags).forEach(([k, v]) => scope.setTag(k, v));
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([k, v]) => scope.setExtra(k, v));
    }
    if (context?.level) scope.setLevel(context.level);
    Sentry.captureException(error);
  });
}

/**
 * Capturer un message informatif (non-erreur).
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  extra?: Record<string, unknown>
): void {
  Sentry.withScope((scope) => {
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
}

/**
 * Ajouter un breadcrumb de navigation.
 */
export function addNavigationBreadcrumb(routeName: string, params?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigate to ${routeName}`,
    data: { route: routeName, params },
    level: 'info',
  });
}

/**
 * Ajouter un breadcrumb d'action utilisateur.
 */
export function addUserActionBreadcrumb(action: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: action,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrapper pour mesurer la performance d'une opération async.
 */
export async function withPerformanceTracking<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = Sentry.startInactiveSpan({ name: operationName, op: 'custom' });
  try {
    const result = await fn();
    span?.end();
    return result;
  } catch (err) {
    span?.end();
    captureException(err, { tags: { operation: operationName } });
    throw err;
  }
}

export { Sentry };
