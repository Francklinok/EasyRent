import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { MotiView } from 'moti';
import { ChevronRight, Calendar, Home, Briefcase } from 'lucide-react-native';
import { UserAction } from '@/types/payment';
import { getWalletService } from '@/services/api/walletService';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';

interface SelectPaymentTypeProps {
    onSelect: (action: UserAction) => void;
    onBack: () => void;
    userId?: string;
}

export const SelectPaymentType: React.FC<SelectPaymentTypeProps> = ({ onSelect, onBack, userId }) => {
    const [actions, setActions] = useState<UserAction[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        loadActions();
    }, [userId]);

    const loadActions = async () => {
        try {
            setLoading(true);
            const walletService = getWalletService();
            const result = await walletService.getOngoingActivities('all');

            const mappedActions: UserAction[] = (result.activities || [])
                .filter(activity => activity.paymentStatus !== 'paid' && activity.paymentStatus !== 'COMPLETED')
                .map(activity => ({
                    id: activity.id,
                    type: activity.type as 'reservation' | 'rent' | 'service',
                    title: activity.title,
                    description: activity.description || getDefaultDescription(activity.type),
                    amount: activity.amount,
                    currency: activity.currency || 'XOF',
                    status: mapPaymentStatus(activity.paymentStatus),
                    dueDate: activity.endDate ? new Date(activity.endDate) : undefined,
                    createdAt: activity.createdAt ? new Date(activity.createdAt) : new Date(),
                    metadata: {
                        serviceId: activity.service?.id,
                        subscriptionId: activity.referenceId,
                        invoiceId: activity.invoiceId,
                        propertyId: activity.property?.id,
                        acceptedPaymentMethods: activity.property?.ownerCriteria?.acceptedPaymentMethods || activity.service?.acceptedPaymentMethods || undefined
                    }
                }));

            setActions(mappedActions);
        } catch (error) {
            console.error('❌ Error loading payment actions:', error);
            Alert.alert(t('walletComponents.error'), t('walletComponents.paymentError'));
        } finally {
            setLoading(false);
        }
    };

    const getDefaultDescription = (type: string): string => {
        switch (type) {
            case 'reservation': return 'Réservation';
            case 'rent': return 'Loyer mensuel';
            case 'service': return 'Service';
            default: return '';
        }
    };

    const mapPaymentStatus = (paymentStatus: string): 'pending' | 'active' | 'completed' | 'cancelled' | 'accepted' => {
        switch (paymentStatus?.toLowerCase()) {
            case 'unpaid':
            case 'pending': return 'pending';
            case 'active': return 'active';
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            case 'accepted': return 'accepted';
            default: return 'pending';
        }
    };

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'reservation': return Calendar;
            case 'rent': return Home;
            case 'service': return Briefcase;
            default: return Calendar;
        }
    };

    const getActionColor = (type: string) => {
        switch (type) {
            case 'reservation': return theme.warning;
            case 'rent': return theme.primary;
            case 'service': return theme.secondary;
            default: return theme.primary;
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="normal" style={styles.loadingText}>{t('common.loading')}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Title */}
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="normaltitle">{t('walletComponents.whatToPayTitle')}</ThemedText>
                <ThemedText type="normal" intensity="light" style={{ color: theme.text }}>
                    {t('walletComponents.selectPaymentTypeDesc')}
                </ThemedText>
            </ThemedView>

            {/* Actions List */}
            <ThemedView style={styles.actionsList}>
                {actions.length > 0 ? (
                    actions.map((action, index) => {
                        const Icon = getActionIcon(action.type);
                        return (
                            <MotiView
                                key={action.id}
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', delay: index * 100 }}
                            >
                                <TouchableOpacity
                                    onPress={() => onSelect(action)}
                                    activeOpacity={0.7}
                                    style={{ ...styles.actionCard, borderColor: theme.outline, borderWidth: 1 }}
                                >
                                    <ThemedView style={[styles.iconContainer, { backgroundColor: getActionColor(action.type) + '15' }]}>
                                        <Icon size={24} color={getActionColor(action.type)} strokeWidth={2} />
                                    </ThemedView>

                                    <ThemedView style={styles.actionInfo}>
                                        <ThemedText type="normal" style={{ color: theme.text, marginBottom: 4, fontWeight: 600 }}>{action.title}</ThemedText>
                                        {action.description && (
                                            <ThemedText type="body" intensity="light" style={{ color: theme.text, marginBottom: 4 }}>
                                                {action.description}
                                            </ThemedText>
                                        )}
                                        {action.dueDate && (
                                            <ThemedText type="caption" style={{ color: theme.star }}>
                                                {t('walletComponents.dueDate', { date: new Date(action.dueDate).toLocaleDateString('fr-FR') })}
                                            </ThemedText>
                                        )}
                                    </ThemedView>

                                    <ThemedView style={styles.amountContainer}>
                                        <ThemedText type="normal" intensity="strong" style={{ color: theme.secondary, marginBottom: 4 }}>
                                            {action.amount.toLocaleString()} {action.currency}
                                        </ThemedText>
                                        <ChevronRight size={20} color={theme.text + '80'} />
                                    </ThemedView>
                                </TouchableOpacity>
                            </MotiView>
                        );
                    })
                ) : (
                    <ThemedView style={styles.emptyContainer}>
                        <Home size={48} color={theme.text} style={{ opacity: 0.5 }} />
                        <ThemedText style={{ color: theme.text, marginTop: 8 }}>{t('walletComponents.noPendingPayments')}</ThemedText>
                        <ThemedText style={{ color: theme.text, marginBottom: 8, textAlign: 'center' }}>
                            {t('walletComponents.upcomingPaymentsDesc')}
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    actionsList: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionInfo: {
        flex: 1,
    },
    amountContainer: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 16,
    },
});
