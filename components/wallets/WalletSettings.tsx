import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { MotiView } from 'moti';
import { ChevronLeft, Smartphone, CreditCard, DollarSign, Check, ChevronRight, Trash2 } from 'lucide-react-native';
import { PaymentConfig, PaymentMethodType } from '@/types/payment';
import { paymentConfigService } from '@/services/PaymentConfigService';
import { ThemedView } from '../ui/ThemedView';
import { useTheme } from '../../hooks/themehook';
import { useLanguage } from '@/components/contexts/language';


const COLORS = {
    primary: '#8B5CF6',
    background: '#FAFAFA',
    white: '#FFFFFF',
    text: '#1F2937',
    textGray: '#6B7280',
    success: '#10B981',
    danger: '#EF4444',
    border: '#E5E7EB',
};

interface WalletSettingsProps {
    onBack: () => void;
    onConfigureMethod: (type: PaymentMethodType) => void;
}

export const WalletSettings: React.FC<WalletSettingsProps> = ({ onBack, onConfigureMethod }) => {
    const [configs, setConfigs] = useState<PaymentConfig[]>([]);
    const [defaultMethod, setDefaultMethod] = useState<PaymentMethodType | null>(null);
    const { theme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        const allConfigs = await paymentConfigService.getAllConfigs();
        const defaultMeth = await paymentConfigService.getDefaultMethod();
        setConfigs(allConfigs);
        setDefaultMethod(defaultMeth);
    };

    const handleSetDefault = async (type: PaymentMethodType) => {
        try {
            await paymentConfigService.setDefaultMethod(type);
            setDefaultMethod(type);
            Alert.alert(t('common.success'), t('walletComponents.defaultMethodUpdated'));
        } catch (error) {
            Alert.alert(t('common.error'), t('walletComponents.defaultMethodError'));
        }
    };

    const handleDelete = async (type: PaymentMethodType) => {
        Alert.alert(
            t('common.delete'),
            t('walletComponents.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await paymentConfigService.deleteConfig(type);
                            await loadConfigs();
                            Alert.alert(t('common.success'), t('walletComponents.methodDeleted'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('walletComponents.deleteError'));
                        }
                    }
                }
            ]
        );
    };

    const methods: Array<{ type: PaymentMethodType; icon: any; label: string; description: string }> = [
        {
            type: 'mobile_money',
            icon: Smartphone,
            label: t('walletComponents.mobileMoney'),
            description: t('walletComponents.mobileMoneyDesc')
        },
        {
            type: 'bank_card',
            icon: CreditCard,
            label: t('walletComponents.bankCard'),
            description: t('walletComponents.bankCardDesc')
        },
        {
            type: 'paypal',
            icon: DollarSign,
            label: t('walletComponents.paypal'),
            description: t('walletComponents.paypalDesc')
        }
    ];

    const getConfigForMethod = (type: PaymentMethodType) => {
        return configs.find(c => c.type === type);
    };

    return (
        <ThemedView style={styles.container}>
            {/* Title */}
            <ThemedView style={styles.titleContainer}>
                <ThemedText  type ="subtitle" intensity = "strong" style={styles.title}>{t('walletComponents.paymentMethods')}</ThemedText>
                <ThemedText type ="body" intensity = "light" >
                    {t('walletComponents.configurePaymentMethods')}
                </ThemedText>
            </ThemedView>

            {/* Methods List */}
            <ScrollView>
            <ThemedView style={styles.methodsList}>
                {methods.map((method, index) => {
                    const Icon = method.icon;
                    const config = getConfigForMethod(method.type);
                    const isConfigured = config?.isConfigured || false;
                    const isDefault = defaultMethod === method.type;

                    return (
                        <MotiView
                            key={method.type}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'spring', delay: index * 100 }}
                        >
                            <ThemedView style={{...styles.methodCard, borderColor:theme.outline}}>
                                <ThemedView style={styles.methodHeader}>
                                    <ThemedView style={styles.methodLeft}>
                                        <ThemedView style={[styles.iconContainer, { backgroundColor:theme.secondary + '15' }]}>
                                            <Icon size={24} color={theme.secondary} strokeWidth={2} />
                                        </ThemedView>

                                        <ThemedView style={styles.methodInfo}>
                                            <ThemedText type = "normal" intensity = "strong" style={styles.methodLabel}>{method.label}</ThemedText>
                                            <ThemedText type = "body" intensity = "light" style={styles.methodDescription}>
                                                {method.description}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>

                                    {isConfigured ? (
                                        <ThemedView style={styles.configuredBadge}>
                                            <Check size={14} color={theme.success} />
                                            <ThemedText type = "body" intensity = "light">{t('walletComponents.configured')}</ThemedText>
                                        </ThemedView>
                                    ) : (
                                        <TouchableOpacity
                                            style={{...styles.configureButton, backgroundColor:theme.secondary}}
                                            onPress={() => onConfigureMethod(method.type)}
                                        >
                                            <ThemedText type = "body" intensity = "strong" style={styles.configureButtonText}>{t('walletComponents.configure')}</ThemedText>
                                        </TouchableOpacity>
                                    )}
                                </ThemedView>

                                {isConfigured && config && (
                                    <ThemedView style={styles.methodActions}>
                                        <ThemedView style={styles.defaultRow}>
                                            <ThemedText style={styles.defaultLabel}>{t('walletComponents.defaultMethod')}</ThemedText>
                                            <Switch
                                                value={isDefault}
                                                onValueChange={() => handleSetDefault(method.type)}
                                                trackColor={{ false:theme.outline, true: theme.secondary }}
                                                thumbColor={theme.text}
                                            />
                                        </ThemedView>

                                        <ThemedView style={styles.actionsRow}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => onConfigureMethod(method.type)}
                                            >
                                                <ThemedText type = "body">{t('walletComponents.modify')}</ThemedText>
                                                <ChevronRight size={16} color={theme.secondary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionButton, { borderColor: theme.error, backgroundColor:theme.error + '40' }]}
                                                onPress={() => handleDelete(method.type)}
                                            >
                                                <Trash2 size={16} color={theme.error} />
                                                <ThemedText style={[styles.actionButtonText, { color: theme.error }]}>
                                                    {t('walletComponents.deleteMethod')}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        </ThemedView>
                                    </ThemedView>
                                )}
                            </ThemedView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },

    titleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    title: {
        marginBottom: 8,
    },
    
    methodsList: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    methodCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    methodLabel: {
        marginBottom: 4,
    },
    methodDescription: {
    },
    configuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },

    configureButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    configureButtonText: {
        color: 'white',
       
    },
    methodActions: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    defaultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    defaultLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    deleteButton: {
        borderColor: COLORS.danger + '40',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
});
