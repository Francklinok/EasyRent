import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Slot, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet as WalletIcon } from 'lucide-react-native';
import { minTouchSize, hitSlop } from '@/constants/tokens';
import { useLanguage } from '@/components/contexts/language';
import { StripeProvider } from '@stripe/stripe-react-native';
import { getWalletService } from '@/services/api/walletService';

// StripeProvider scoped au Wallet plutôt qu'à la racine de l'app : évite un
// appel réseau bloquant au démarrage global pour une fonctionnalité secondaire.
// Sans clé (chargement en cours ou config absente), les enfants s'affichent
// quand même — seul CardField/confirmPayment échoueraient, pas tout le Wallet.
function WalletStripeProvider({ children }: { children: React.ReactElement }) {
    const [publishableKey, setPublishableKey] = useState<string | null>(null);

    useEffect(() => {
        getWalletService()
            .getWalletConfig()
            .then((config) => setPublishableKey(config.stripePublishableKey || ''))
            .catch(() => setPublishableKey(''));
    }, []);

    if (!publishableKey) {
        return children;
    }

    return <StripeProvider publishableKey={publishableKey}>{children}</StripeProvider>;
}

// Context pour gérer le titre dynamique du header
interface WalletHeaderContextType {
    title: string;
    setTitle: (title: string) => void;
    showSettingsButton: boolean;
    setShowSettingsButton: (show: boolean) => void;
    showBackButton: boolean;
    setShowBackButton: (show: boolean) => void;
    onBackPress?: () => void;
    setOnBackPress?: (callback: () => void) => void;
}

const WalletHeaderContext = createContext<WalletHeaderContextType>({
    title: 'Wallet',
    setTitle: () => {},
    showSettingsButton: true,
    setShowSettingsButton: () => {},
    // Masqué par défaut : l'onglet Wallet est un écran racine, un bouton
    // retour n'y a de sens que sur les sous-sections (paiement, réglages...).
    showBackButton: false,
    setShowBackButton: () => {},
    onBackPress: undefined,
    setOnBackPress: () => {},
});

export const useWalletHeader = () => useContext(WalletHeaderContext);

// Mapping des sections vers leurs clés de traduction (walletComponents.*).
// Résolu via t() côté Wallet.tsx, qui a accès à useLanguage() — ce fichier
// _layout.tsx n'étant pas lui-même un composant consommateur de ce contexte
// pour cette table statique.
export const WALLET_SECTION_TITLE_KEYS: Record<string, string> = {
    'main': 'walletComponents.wallet',
    'crypto': 'walletComponents.crypto',
    'receive': 'walletComponents.receive',
    'qr-payment': 'walletComponents.qrPayment',
    'payment': 'walletComponents.payment',
    'direct-payment': 'walletComponents.sendMoney',
    'pay-rent': 'walletComponents.payRent',
    'mobile-money': 'walletComponents.mobileMoneyTitle',
    'bank-card-form': 'walletComponents.bankCardForm',
    'paypal-form': 'walletComponents.paypal',
    'create-payment-code': 'walletComponents.createPaymentCode',
    'pay-with-code': 'walletComponents.payWithCode',
    'security': 'walletComponents.securityTitle',
    'settings': 'walletComponents.settings',
    'select-payment-method': 'walletComponents.selectPaymentMethodTitle',
    'mobile-money-form': 'walletComponents.mobileMoneyTitle',
    'configure-mobile-money': 'walletComponents.configureMobileMoney',
    'transactions': 'walletComponents.transactions',
};

// Pas de clé i18n dédiée pour ce titre (cohérent avec le texte en dur déjà
// présent dans WalletHomes.tsx pour la même fonctionnalité).
export const WALLET_INVEST_TOKENS_TITLE = "Mes tokens d'investissement";

export default function WalletLayout() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets().top;
    const [title, setTitle] = useState('Wallet');
    const [showSettingsButton, setShowSettingsButton] = useState(true);
    const [showBackButton, setShowBackButton] = useState(false);
    const [onBackPress, setOnBackPress] = useState<(() => void) | undefined>(undefined);

    const handleSetTitle = useCallback((newTitle: string) => {
        setTitle(newTitle);
    }, []);

    const handleSetShowSettingsButton = useCallback((show: boolean) => {
        setShowSettingsButton(show);
    }, []);

    const handleSetShowBackButton = useCallback((show: boolean) => {
        setShowBackButton(show);
    }, []);

    const handleSetOnBackPress = useCallback((callback: () => void) => {
        setOnBackPress(() => callback);
    }, []);

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    const renderHeader = () => (
        <ThemedView
            style={{
                paddingHorizontal: 20,
                paddingTop: insets + 10,
                paddingBottom: 10,
            }}
        >
            <ThemedView style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 12 }}>
                    {showBackButton && (
                        <TouchableOpacity
                            onPress={handleBackPress}
                            accessibilityRole="button"
                            accessibilityLabel="Retour"
                            hitSlop={hitSlop}
                            style={{
                                width: minTouchSize,
                                height: minTouchSize,
                                backgroundColor: theme.surface,
                                borderRadius: minTouchSize / 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={20} color= {theme.text} />
                        </TouchableOpacity>
                    )}
                    <ThemedView style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        gap: 8
                    }}>
                        <ThemedView style={{
                            backgroundColor: theme.surface,
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <WalletIcon size={16} color= {theme.text} strokeWidth={2.5} />
                        </ThemedView>
                        <ThemedText type="subtitle" intensity="strong" style={{ color:  theme.text }}>
                            {title}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {showSettingsButton && (
                    <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => {
                                handleSetTitle(t('walletComponents.settings'));
                                router.push('/wallet/settings' as any);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={t('walletComponents.settings')}
                            hitSlop={hitSlop}
                            style={{
                                width: minTouchSize,
                                height: minTouchSize,
                                backgroundColor: theme.surface,
                                borderRadius: minTouchSize / 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialCommunityIcons name="cog" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </ThemedView>
                )}
            </ThemedView>
        </ThemedView>
    );

    return (
        <WalletHeaderContext.Provider value={{
            title,
            setTitle: handleSetTitle,
            showSettingsButton,
            setShowSettingsButton: handleSetShowSettingsButton,
            showBackButton,
            setShowBackButton: handleSetShowBackButton,
            onBackPress,
            setOnBackPress: handleSetOnBackPress
        }}>
            <ThemedView style={{ flex: 1 }}>
                {renderHeader()}
                <WalletStripeProvider>
                    <Slot />
                </WalletStripeProvider>
            </ThemedView>
        </WalletHeaderContext.Provider>
    );
}
