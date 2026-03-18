import React, { createContext, useContext, useState, useCallback } from 'react';
import { Slot, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet as WalletIcon } from 'lucide-react-native';

// Context pour gérer le titre dynamique du header
interface WalletHeaderContextType {
    title: string;
    setTitle: (title: string) => void;
    showSettingsButton: boolean;
    setShowSettingsButton: (show: boolean) => void;
    onBackPress?: () => void;
    setOnBackPress?: (callback: () => void) => void;
}

const WalletHeaderContext = createContext<WalletHeaderContextType>({
    title: 'Wallet',
    setTitle: () => {},
    showSettingsButton: true,
    setShowSettingsButton: () => {},
    onBackPress: undefined,
    setOnBackPress: () => {},
});

export const useWalletHeader = () => useContext(WalletHeaderContext);

// Mapping des sections vers les titres
export const WALLET_SECTION_TITLES: Record<string, string> = {
    'main': 'Wallet',
    'crypto': 'Crypto',
    'receive': 'Recevoir',
    'qr-payment': 'QR Payment',
    'payment': 'Paiement',
    'direct-payment': 'Envoyer',
    'pay-rent': 'Payer Loyer',
    'mobile-money': 'Mobile Money',
    'bank-card-form': 'Carte Bancaire',
    'paypal-form': 'PayPal',
    'create-payment-code': 'Créer Code',
    'pay-with-code': 'Payer avec Code',
    'security': 'Sécurité',
    'settings': 'Paramètres',
    'select-payment-method': 'Méthode de Paiement',
    'mobile-money-form': 'Mobile Money',
    'configure-mobile-money': 'Configurer Mobile Money',
    'transactions': 'Transactions',
    'invest-tokens': 'Mes Tokens',
};

export default function WalletLayout() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets().top;
    const [title, setTitle] = useState('Wallet');
    const [showSettingsButton, setShowSettingsButton] = useState(true);
    const [onBackPress, setOnBackPress] = useState<(() => void) | undefined>(undefined);

    const handleSetTitle = useCallback((newTitle: string) => {
        setTitle(newTitle);
    }, []);

    const handleSetShowSettingsButton = useCallback((show: boolean) => {
        setShowSettingsButton(show);
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
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: 20,
                            padding: 8
                        }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={20} color= {theme.text} />
                    </TouchableOpacity>
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
                                handleSetTitle('Paramètres');
                                router.push('/wallet/settings' as any);
                            }}
                            style={{
                                backgroundColor: theme.surface,
                                borderRadius: 20,
                                padding: 8
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
            onBackPress,
            setOnBackPress: handleSetOnBackPress
        }}>
            <ThemedView style={{ flex: 1 }}>
                {renderHeader()}
                <Slot />
            </ThemedView>
        </WalletHeaderContext.Provider>
    );
}
