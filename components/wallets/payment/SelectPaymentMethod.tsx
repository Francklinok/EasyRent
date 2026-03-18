import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { MotiView } from 'moti';
import { CreditCard, Smartphone, DollarSign, Check, Banknote, ArrowLeftRight, Star, Lock } from 'lucide-react-native';
import { UserAction, PaymentConfig, PaymentMethodType } from '@/types/payment';
import { paymentConfigService } from '@/services/PaymentConfigService';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';

interface SelectPaymentMethodProps {
    action: UserAction;
    onSelect: (method: PaymentConfig | PaymentMethodType) => void;
    onBack: () => void;
}

const ALL_METHODS: Array<{ type: PaymentMethodType; icon: any; label: string; desc: string }> = [
    { type: 'mobile_money', icon: Smartphone,      label: 'Mobile Money',       desc: 'MTN, Orange, Wave...' },
    { type: 'bank_card',    icon: CreditCard,       label: 'Carte bancaire',     desc: 'Visa, Mastercard, Amex' },
    { type: 'paypal',       icon: DollarSign,       label: 'PayPal',             desc: 'Paiement sécurisé' },
    { type: 'bank_transfer',icon: ArrowLeftRight,   label: 'Virement bancaire',  desc: 'IBAN, SWIFT' },
    { type: 'cash',         icon: Banknote,         label: 'Espèces',            desc: '' },
];

export const SelectPaymentMethod: React.FC<SelectPaymentMethodProps> = ({ action, onSelect, onBack }) => {
    const [configs, setConfigs] = useState<PaymentConfig[]>([]);
    const [defaultMethod, setDefaultMethod] = useState<PaymentMethodType | null>(null);
    const { theme } = useTheme();
    const { t } = useLanguage();

    // Methods accepted by the property owner
    const ownerAccepted: PaymentMethodType[] = (action.metadata?.acceptedPaymentMethods as PaymentMethodType[]) || [];
    const hasOwnerPrefs = ownerAccepted.length > 0;

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        const allConfigs = await paymentConfigService.getAllConfigs();
        const defaultMeth = await paymentConfigService.getDefaultMethod();
        setConfigs(allConfigs);
        setDefaultMethod(defaultMeth);
    };

    const getConfigForMethod = (type: PaymentMethodType) => configs.find(c => c.type === type);

    const isOwnerPreferred = (type: PaymentMethodType) =>
        !hasOwnerPrefs || ownerAccepted.includes(type);

    // Sort: owner-preferred first, then others
    const sortedMethods = [...ALL_METHODS].sort((a, b) => {
        const aPreferred = isOwnerPreferred(a.type);
        const bPreferred = isOwnerPreferred(b.type);
        if (aPreferred && !bPreferred) return -1;
        if (!aPreferred && bPreferred) return 1;
        return 0;
    });

    return (
        <ThemedView style={styles.container}>

            {/* Title */}
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="normaltitle" style={{ paddingBottom: 4, paddingTop: 10 }}>
                    {t('walletComponents.choosePaymentMethod')}
                </ThemedText>
                <ThemedText type="body" intensity="light">
                    {t('walletComponents.selectPaymentMethodDesc')}
                </ThemedText>
                {hasOwnerPrefs && (
                    <ThemedView style={[styles.ownerPrefBanner, { backgroundColor: theme.secondary + '15', borderColor: theme.secondary + '30' }]}>
                        <Star size={14} color={theme.primary} />
                        <ThemedText type="caption" style={{ color: theme.primary, marginLeft: 6, flex: 1 }}>
                            {t('walletComponents.ownerPreferredMethods')}
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>

            <ScrollView>
                <ThemedView style={styles.methodsList}>
                    {sortedMethods.map((method, index) => {
                        const Icon = method.icon;
                        const config = getConfigForMethod(method.type);
                        const isConfigured = config?.isConfigured || false;
                        const isDefault = defaultMethod === method.type;
                        const preferred = isOwnerPreferred(method.type);
                        const isCash = method.type === 'cash';

                        return (
                            <MotiView
                                key={method.type}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: preferred ? 1 : 0.45, translateX: 0 }}
                                transition={{ type: 'spring', delay: index * 80 }}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.methodCard,
                                        {
                                            borderColor: preferred
                                                ? (isCash ? theme.warning + '80' : theme.outline)
                                                : theme.outline,
                                            
                                        }
                                    ]}
                                    onPress={() => preferred ? onSelect(config || method.type) : undefined}
                                    activeOpacity={preferred ? 0.7 : 1}
                                >
                                    {/* Owner preferred badge */}
                                    {preferred && hasOwnerPrefs && (
                                        <ThemedView style={[styles.preferredBadge, { backgroundColor: theme.primary }]}>
                                            <Star size={9} color="white" fill="white" />
                                        </ThemedView>
                                    )}

                                    {/* Lock icon for non-accepted */}
                                    {!preferred && (
                                        <ThemedView style={[styles.preferredBadge, { backgroundColor: theme.text }]}>
                                            <Lock size={9} color="white" />
                                        </ThemedView>
                                    )}

                                    <ThemedView style={styles.methodLeft}>
                                        <ThemedView style={[
                                            styles.iconContainer,
                                            { backgroundColor: preferred
                                                ? (isCash ? theme.warning + '20' : theme.secondary + '15')
                                                : "transparent" }
                                        ]}>
                                            <Icon
                                                size={24}
                                                color={preferred ? (isCash ? theme.warning : theme.primary) : theme.text }
                                                strokeWidth={2}
                                            />
                                        </ThemedView>

                                        <ThemedView style={styles.methodInfo}>
                                            <ThemedView style={styles.methodTitleRow}>
                                                <ThemedText
                                                    type="normal"
                                                    style={{ color: preferred ? theme.text : theme.text + '90' }}
                                                >
                                                    {method.label}
                                                </ThemedText>
                                                {isDefault && preferred && (
                                                    <ThemedView style={[styles.defaultBadge, { backgroundColor: theme.secondary }]}>
                                                        <Check size={10} color="white" />
                                                        <ThemedText style={styles.defaultText}>{t('walletComponents.defaultPaymentMethod')}</ThemedText>
                                                    </ThemedView>
                                                )}
                                            </ThemedView>

                                            <ThemedText
                                                type="body"
                                                intensity="light"
                                            >
                                                {isCash
                                                    ? t('walletComponents.cashPaymentOwnerConfirms')
                                                    : method.desc}
                                            </ThemedText>

                                            {isConfigured && preferred && (
                                                <ThemedText style={[styles.configuredText, { color: theme.success }]}>
                                                    ✓ {t('walletComponents.configuredLabel')}
                                                </ThemedText>
                                            )}

                                            {!preferred && (
                                                <ThemedText style={[styles.configuredText, { color: theme.text + '40' }]}>
                                                    {t('walletComponents.notAcceptedByOwner')}
                                                </ThemedText>
                                            )}
                                        </ThemedView>
                                    </ThemedView>
                                </TouchableOpacity>
                            </MotiView>
                        );
                    })}
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 6,
    },
    ownerPrefBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 4,
    },
    methodsList: {
        paddingHorizontal: 14,
        paddingBottom: 20,
        gap: 10,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        position: 'relative',
    },
    preferredBadge: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    methodInfo: {
        flex: 1,
        gap: 2,
    },
    methodTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 4,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },
    configuredText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
});
