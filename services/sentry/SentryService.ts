/**
 * SentryService – Service centralisé de monitoring pour EasyRent (frontend).
 *
 * Fournit :
 * - Identification utilisateur (login/logout)
 * - Capture d'erreurs contextualisées
 * - Performance tracking (requêtes API, actions métier)
 * - Événements métier (booking, paiement, KYC, etc.)
 * - Audit trail (breadcrumbs structurés)
 */

import * as Sentry from '@sentry/react-native';
import {
  setSentryUser,
  clearSentryUser,
  captureException,
  captureMessage,
  addNavigationBreadcrumb,
  addUserActionBreadcrumb,
  withPerformanceTracking,
} from './sentryConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Gestion utilisateur
// ─────────────────────────────────────────────────────────────────────────────

class _SentryService {
  /**
   * À appeler après un login réussi.
   */
  onLogin(user: {
    id: string;
    email?: string;
    username?: string;
    role?: 'tenant' | 'owner' | 'admin';
    isOwner?: boolean;
  }): void {
    setSentryUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    Sentry.setTag('user.isOwner', String(user.isOwner ?? false));
    Sentry.setTag('user.role', user.role ?? 'tenant');

    addUserActionBreadcrumb('User logged in', { userId: user.id, role: user.role });
  }

  /**
   * À appeler après un logout.
   */
  onLogout(): void {
    addUserActionBreadcrumb('User logged out');
    clearSentryUser();
    Sentry.setTag('user.isOwner', 'false');
    Sentry.setTag('user.role', 'anonymous');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Capture d'erreurs métier
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Erreur lors d'une requête API.
   */
  captureApiError(error: unknown, endpoint: string, method = 'GET', statusCode?: number): void {
    captureException(error, {
      tags: {
        type: 'api_error',
        endpoint,
        method,
        ...(statusCode ? { status_code: String(statusCode) } : {}),
      },
      extra: { endpoint, method, statusCode },
      level: statusCode && statusCode >= 500 ? 'error' : 'warning',
    });
  }

  /**
   * Erreur de paiement / wallet.
   */
  capturePaymentError(error: unknown, amount?: number, currency = 'XOF'): void {
    captureException(error, {
      tags: { type: 'payment_error', currency },
      extra: { amount, currency },
      level: 'error',
    });
  }

  /**
   * Erreur KYC.
   */
  captureKycError(error: unknown, step: string): void {
    captureException(error, {
      tags: { type: 'kyc_error', kyc_step: step },
      extra: { step },
      level: 'error',
    });
  }

  /**
   * Erreur de chargement de propriété.
   */
  capturePropertyError(error: unknown, propertyId?: string): void {
    captureException(error, {
      tags: { type: 'property_error' },
      extra: { propertyId },
      level: 'warning',
    });
  }

  /**
   * Erreur de réservation.
   */
  captureBookingError(error: unknown, bookingData?: Record<string, unknown>): void {
    captureException(error, {
      tags: { type: 'booking_error' },
      extra: bookingData,
      level: 'error',
    });
  }

  /**
   * Erreur d'authentification.
   */
  captureAuthError(error: unknown, action: 'login' | 'register' | 'refresh' | '2fa'): void {
    captureException(error, {
      tags: { type: 'auth_error', auth_action: action },
      level: 'warning',
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Événements métier (non-erreurs)
  // ─────────────────────────────────────────────────────────────────────────

  trackBookingCreated(propertyId: string, amount: number): void {
    captureMessage('Booking created', 'info', { propertyId, amount });
    addUserActionBreadcrumb('Booking created', { propertyId, amount });
  }

  trackPaymentSuccess(amount: number, currency = 'XOF', transactionId?: string): void {
    captureMessage('Payment successful', 'info', { amount, currency, transactionId });
    addUserActionBreadcrumb('Payment successful', { amount, currency, transactionId });
  }

  trackPropertyViewed(propertyId: string, title?: string): void {
    addUserActionBreadcrumb('Property viewed', { propertyId, title });
  }

  trackSearchPerformed(query: string, filters?: Record<string, unknown>): void {
    addUserActionBreadcrumb('Search performed', { query, filters });
  }

  trackKycStepCompleted(step: string): void {
    addUserActionBreadcrumb('KYC step completed', { step });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Performance tracking
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mesurer la durée d'une opération async.
   * Usage:
   * ```ts
   * const result = await SentryService.trackAsync('fetchProperties', () => api.getProperties());
   * ```
   */
  async trackAsync<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    return withPerformanceTracking(operationName, fn);
  }

  /**
   * Démarrer un span de performance manuel.
   * Usage :
   * ```ts
   * const finish = SentryService.startSpan('loadImages');
   * // ... opération ...
   * finish();
   * ```
   */
  startSpan(name: string, op = 'custom'): () => void {
    const span = Sentry.startInactiveSpan({ name, op });
    return () => span?.end();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  trackNavigation(routeName: string, params?: Record<string, unknown>): void {
    addNavigationBreadcrumb(routeName, params);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilitaires
  // ─────────────────────────────────────────────────────────────────────────

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  setExtra(key: string, value: unknown): void {
    Sentry.setExtra(key, value);
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    Sentry.addBreadcrumb({ message, category, data, level: 'info' });
  }
}

export const SentryService = new _SentryService();
