
import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { MotiView } from 'moti';
import {
    ChevronLeft,
    Settings,
    Lock,
    Bell,
    ChevronRight,
    Send,
    Download,
    TrendingUp,
    Circle,
    Wallet as WalletIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Home,
    Briefcase,
    Calendar
} from 'lucide-react-native';
import { OngoingActivity } from '@/services/api/walletService';
const { width } = Dimensions.get('window');

interface WalletHomeProps {
    balance: number;
    pendingBalance: number;
    currency: string;
    formatAmount: (amount: number, currency?: string) => string;
    onNavigate: (section: string) => void;
    transactions: any[];
    walletData: any;
    ongoingActivities?: OngoingActivity[];
    activitiesLoading?: boolean;
    activitiesByType?: {
        services: number;
        reservations: number;
        rents: number;
    };
}

export const WalletHome: React.FC<WalletHomeProps> = ({
    balance,
    pendingBalance,
    currency,
    formatAmount,
    onNavigate,
    transactions,
    walletData,
    ongoingActivities = [],
    activitiesLoading = false,
    activitiesByType = { services: 0, reservations: 0, rents: 0 }
}) => {
    const [activeTab, setActiveTab] = useState<'history' | 'payments' | 'services'>('history');
    const { theme } = useTheme();

    // Helper function to get activity icon
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'service':
                return <Briefcase size={18} color={theme.secondary} strokeWidth={2} />;
            case 'reservation':
                return <Calendar size={18} color={theme.warning} strokeWidth={2} />;
            case 'rent':
                return <Home size={18} color={theme.error} strokeWidth={2} />;
            default:
                return <CreditCard size={18} color={theme.success} strokeWidth={2} />;
        }
    };

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return theme.success;
            case 'pending':
            case 'unpaid':
                return theme.star;
            case 'overdue':
            case 'failed':
                return theme.error;
            default:
                return theme.text;
        }
    };

    // Date
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    return (
        <ThemedView
            style={styles.mainContainer}
        >

            {/* principal card */}
            <ThemedView backgroundColor="transparent" style={styles.cardContainer}>
                <ThemedView style={{...styles.mainCard, borderColor: theme.outline }}>
                    {/* Time */}
                    <ThemedView backgroundColor="transparent" style={styles.timeRow}>
                        <Clock size={14} color={theme.text + "70"} />
                        <ThemedText type="caption" size={12} color={theme.text + "70"} style={{ fontWeight: '500' }}>
                            Today, {timeString}
                        </ThemedText>
                    </ThemedView>

                    {/* principal balance */}
                    <ThemedText type="heading" size={30} color={theme.text} style={styles.balanceAmount}>
                        {formatAmount(balance, currency)}
                    </ThemedText>
                    <ThemedText type="normal" size={14} color={theme.text + "70"} style={styles.availableBalance}>
                        Available Balance: <ThemedText type="normal" size={14} color={theme.secondary} intensity="strong">{formatAmount(balance - pendingBalance, currency)}</ThemedText>
                    </ThemedText>

                    <ThemedView  style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('payment')}>
                            <ThemedView backgroundColor={theme.secondary+ "20"} style={styles.actionCircle}>
                                <Send size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                Payment
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('receive')}>
                            <ThemedView backgroundColor={theme.secondary+ "20"} style={styles.actionCircle}>
                                <Download size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                Receive
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('transactions')}>
                            <ThemedView backgroundColor={theme.secondary + "20"} style={styles.actionCircle}>
                                <Bell size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                Activity
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>

            {/* content */}
            <ScrollView>
            <ThemedView backgroundColor="transparent" style={styles.content}>
                <ThemedView backgroundColor="transparent" style={styles.tabsContainer}>
                    <TouchableOpacity
                        // style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                        onPress={() => setActiveTab('history')}
                        style = {{...styles.tab, borderColor: activeTab === 'history' ? theme.secondary : theme.outline + "20" ,
                            borderWidth: 1,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'history' ? theme.secondary : theme.surface,}}
                    >
                        <ThemedText
                            type="normal"
                            size={14}
                            color={activeTab === 'history' ? 'white' :theme.text + "80"}
                            style={{ fontWeight: '600' }}
                        >
                            History
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('payments')}
                         style = {{...styles.tab, borderColor: activeTab === 'payments' ? theme.secondary : theme.outline + "20" ,
                            borderWidth: 1,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'payments' ? theme.secondary : theme.surface,}}
                    >
                        <ThemedView backgroundColor="transparent" style={styles.tabWithBadge}>
                            <ThemedText
                                type="normal"
                                size={14}
                                color={activeTab === 'payments' ? 'white' : theme.text + "80"}
                                style={{ fontWeight: '600' }}
                            >
                                Payments
                            </ThemedText>
                            {ongoingActivities.length > 0 && (
                                <ThemedView
                                    backgroundColor={activeTab === 'payments' ? theme.secondary :theme.secondary + '80'}
                                    style={styles.badge}
                                >
                                    <ThemedText type="caption" size={10} color= {theme.surface} intensity="strong">
                                        {ongoingActivities.length}
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        // style={[styles.tab, activeTab === 'services' && styles.tabActive]}
                        onPress={() => setActiveTab('services')}
                         style = {{...styles.tab, borderColor: activeTab === 'services' ? theme.secondary : theme.outline + "20" ,
                            borderWidth: 1,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'services' ? theme.secondary : theme.surface,}}
                        
                    >
                        <ThemedText
                            type="normal"
                            size={14}
                            color={activeTab === 'services' ? "white": theme.text + "80"}
                            style={{ fontWeight: '600' }}
                        >
                            Services
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Payments - Ongoing Activities (Services, Reservations, Rents) */}
                {activeTab === 'payments' && (
                    <ThemedView backgroundColor="transparent" style={styles.paymentsList}>
                        {/* Summary Cards */}
                        <ThemedView backgroundColor="transparent" style={styles.paymentSummary}>
                            <ThemedView backgroundColor={theme.secondary + '15'} style={styles.summaryCard}>
                                <Briefcase size={20} color={theme.secondary} />
                                <ThemedText type="title" size={20} color={theme.text} intensity="strong">
                                    {activitiesByType.services}
                                </ThemedText>
                                <ThemedText type="caption" size={11} color={theme.text + "80"} style={{ fontWeight: '500' }}>
                                    Services
                                </ThemedText>
                            </ThemedView>
                            <ThemedView backgroundColor={theme.star + '15'} style={styles.summaryCard}>
                                <Calendar size={20} color={theme.star} />
                                <ThemedText type="title" size={20} color={theme.text} intensity="strong">
                                    {activitiesByType.reservations}
                                </ThemedText>
                                <ThemedText type="caption" size={11} color={theme.text + "80"} style={{ fontWeight: '500' }}>
                                    Réservations
                                </ThemedText>
                            </ThemedView>
                            <ThemedView backgroundColor={theme.error + '15'} style={styles.summaryCard}>
                                <Home size={20} color={theme.error} />
                                <ThemedText type="title" size={20} color={theme.text} intensity="strong">
                                    {activitiesByType.rents}
                                </ThemedText>
                                <ThemedText type="caption" size={11} color={theme.text + "80"} style={{ fontWeight: '500' }}>
                                    Loyers
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        {/* Loading State */}
                        {activitiesLoading && (
                            <ThemedView backgroundColor="transparent" style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.secondary} />
                                <ThemedText type="normal" size={14} color={theme.text + "80"} style={{ marginTop: 12 }}>
                                    Chargement...
                                </ThemedText>
                            </ThemedView>
                        )}

                        {/* Activities List */}
                        {!activitiesLoading && ongoingActivities.map((activity, index) => (
                            <MotiView
                                key={activity.id}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', delay: index * 50 }}
                            >
                                <TouchableOpacity
                                    // style={styles.activityItem}
                                    style = {{
                                        ...styles.activityItem,
                                        backgroundColor: theme.surface,
                                        borderColor: theme.outline,
                                       
                                    }}
                                    onPress={() => onNavigate(`activity-detail-${activity.id}`)}
                                >
                                    <ThemedView backgroundColor="transparent" style={styles.activityLeft}>
                                        <ThemedView
                                            backgroundColor={
                                                activity.type === 'service' ? theme.secondary + '15' :
                                                activity.type === 'reservation' ? theme.star + '15' :
                                               theme.error + '15'
                                            }
                                            style={styles.activityIconContainer}
                                        >
                                            {getActivityIcon(activity.type)}
                                        </ThemedView>
                                        <ThemedView backgroundColor="transparent" style={styles.activityDetails}>
                                            <ThemedText type="normal" size={14} color={theme.text} style={{ fontWeight: '600', marginBottom: 2 }} numberOfLines={1}>
                                                {activity.title}
                                            </ThemedText>
                                            <ThemedText type="caption" size={12} color={theme.text + "80"} style={{ marginBottom: 4 }} numberOfLines={1}>
                                                {activity.description || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                            </ThemedText>
                                            <ThemedView backgroundColor="transparent" style={styles.activityMeta}>
                                                <ThemedView backgroundColor={getStatusColor(activity.paymentStatus) + '20'} style={styles.statusBadge}>
                                                    <ThemedText type="caption" size={10} color={getStatusColor(activity.paymentStatus)} style={{ fontWeight: '600' }}>
                                                        {activity.paymentStatus === 'unpaid' ? 'À payer' :
                                                         activity.paymentStatus === 'pending' ? 'En attente' :
                                                         activity.paymentStatus === 'paid' ? 'Payé' : activity.paymentStatus}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                        </ThemedView>
                                    </ThemedView>
                                    <ThemedView backgroundColor="transparent" style={styles.activityRight}>
                                        <ThemedText type="normal" size={14} color={theme.text} intensity="strong">
                                            {formatAmount(activity.amount, activity.currency)}
                                        </ThemedText>
                                        <ChevronRight size={18} color={theme.text + "80"} />
                                    </ThemedView>
                                </TouchableOpacity>
                            </MotiView>
                        ))}

                        {/* Empty State */}
                        {!activitiesLoading && ongoingActivities.length === 0 && (
                            <ThemedView backgroundColor="transparent" style={styles.emptyState}>
                                <CreditCard size={48} color={theme.text + "80"} opacity={0.3} />
                                <ThemedText type="normal" size={14} color={theme.text + "80"} style={{ marginTop: 12 }}>
                                    Aucun paiement en cours
                                </ThemedText>
                                <ThemedText type="caption" size={12} color={theme.text} style={{ marginTop: 4, textAlign: 'center', paddingHorizontal: 32 }}>
                                    Vos services, réservations et loyers apparaîtront ici
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>
                )}

                {/* Services Grid */}
                {activeTab === 'services' && (
                    <ThemedView backgroundColor="transparent" style={styles.servicesGrid}>
                        {[
                            { id: 'rent', name: 'Loyer', icon: 'home', color: '#FF3B30' },
                            { id: 'electricity', name: 'Électricité', icon: 'zap', color: '#FFCC00' },
                            { id: 'internet', name: 'Internet', icon: 'wifi', color: '#007AFF' },
                            { id: 'water', name: 'Eau', icon: 'droplet', color: '#5AC8FA' },
                            { id: 'shopping', name: 'Achats', icon: 'shopping-bag', color: '#FF2D55' },
                            { id: 'services', name: 'Services', icon: 'building', color: '#34C759' }
                        ].map((service, index) => (
                            <MotiView
                                key={service.id}
                                from={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', delay: index * 60 }}
                            >
                                <TouchableOpacity
                                    style={{...styles.serviceCard,borderWidth: 1, borderColor: theme.outline,
                                     }}
                                    onPress={() => onNavigate(`pay-${service.id}`)}
                                >
                                    <ThemedView backgroundColor={service.color + '20'} style={styles.serviceIcon}>
                                        <ThemedText size={24}>
                                            {service.icon === 'home' ? '🏠' :
                                                service.icon === 'zap' ? '⚡' :
                                                    service.icon === 'wifi' ? '📡' :
                                                        service.icon === 'droplet' ? '💧' :
                                                            service.icon === 'shopping-bag' ? '🛍️' : '🏢'}
                                        </ThemedText>
                                    </ThemedView>
                                    <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                        {service.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </ThemedView>
                )}

                {/* Liste des transactions */}
                {activeTab === 'history' && (
                    <ThemedView backgroundColor="transparent" style={styles.transactionsList}>
                        {transactions.slice(0, 5).map((transaction, index) => (
                            <MotiView
                                key={transaction.id}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', delay: index * 50 }}
                            >
                                <TouchableOpacity
                                    style={styles.transactionItem}
                                    onPress={() => onNavigate(`transaction-detail-${transaction.id}`)}
                                >
                                    <ThemedView backgroundColor="transparent" style={styles.txLeft}>
                                        <ThemedView style={styles.txIconContainer}>
                                            <CheckCircle2 size={18} color={theme.success} strokeWidth={2} />
                                        </ThemedView>
                                        <ThemedView backgroundColor="transparent" style={styles.txDetails}>
                                            <ThemedText type="normal" size={13} color={theme.text} style={{ fontWeight: '600', marginBottom: 3 }}>
                                                {transaction.status === 'pending' ? 'Mined for Available Balance' : transaction.description}
                                            </ThemedText>
                                            <ThemedText type="caption" size={11} color={theme.text + "80"}>
                                                {transaction.type || 'Txn ID: '}
                                                <ThemedText type="caption" size={11} color={theme.text} style={{ fontFamily: 'monospace' }}>
                                                    {transaction.id.substring(0, 6)}...
                                                </ThemedText>
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>

                                    <ChevronRight size={18} color={theme.text} />
                                </TouchableOpacity>
                            </MotiView>
                        ))}

                        {transactions.length === 0 && (
                            <ThemedView backgroundColor="transparent" style={styles.emptyState}>
                                <WalletIcon size={48} color={theme.text + "80"} opacity={0.3} />
                                <ThemedText type="normal" size={14} color={theme.text + "80"} style={{ marginTop: 12 }}>
                                    No transactions yet
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>
                )}

                {/* Bouton Show more */}
                {activeTab === 'history' && transactions.length > 5 && (
                    <TouchableOpacity style={styles.showMoreButton} onPress={() => onNavigate('transactions')}>
                        <ThemedText type="normal" size={13} color={theme.secondary} style={{ fontWeight: '600' }}>
                            Show more
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ThemedView>
            </ScrollView>

            <ThemedView backgroundColor="transparent" style={{ height: 40 }} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop:10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    walletIconHeader: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        paddingHorizontal: 12,
        marginBottom: 1,
    },
    mainCard: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    balanceAmount: {
        marginBottom: 8,
        padding: 4,
        letterSpacing: -0.5,
    },
    availableBalance: {
        marginBottom: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        alignItems: 'center',
        flex: 1,
    },
    actionCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        
    },
    content: {
        paddingTop: 8,
    },
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        gap: 20,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 0.5,
    },
   
    transactionsList: {
        paddingHorizontal: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    txLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    txIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txDetails: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    showMoreButton: {
        marginHorizontal: 16,
        marginTop: 8,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    serviceCard: {
        width: (width - 56) / 3,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    tabWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badge: {
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    paymentsList: {
        paddingHorizontal: 16,
    },
    paymentSummary: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        gap: 2,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityDetails: {
        flex: 1,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    activityRight: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 8,
    },
});
