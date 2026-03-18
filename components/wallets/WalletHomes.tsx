
import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
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
    Calendar,
    ArrowRightLeft,
} from 'lucide-react-native';
import { OngoingActivity } from '@/services/api/walletService';
import { useLanguage } from '@/components/contexts/language';
import { useRouter } from 'expo-router';
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
    investTokensCount?: number;
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
    activitiesByType = { services: 0, reservations: 0, rents: 0 },
    investTokensCount = 0,
}) => {
    const [activeTab, setActiveTab] = useState<'payments' | 'history' | 'services' | 'tokens'>('payments');
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

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
                            {t('walletComponents.today')}, {timeString}
                        </ThemedText>
                    </ThemedView>

                    {/* principal balance */}
                    <ThemedText type="heading" size={30} color={theme.text} style={styles.balanceAmount}>
                        {formatAmount(balance, currency)}
                    </ThemedText>
                    <ThemedText type="normal" size={14} color={theme.text + "70"} style={styles.availableBalance}>
                        {t('walletComponents.availableBalance')}: <ThemedText type="normal" size={14} color={theme.secondary} intensity="strong">{formatAmount(balance - pendingBalance, currency)}</ThemedText>
                    </ThemedText>

                    <ThemedView  style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('payment')}>
                            <ThemedView backgroundColor={theme.secondary+ "20"} style={styles.actionCircle}>
                                <Send size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                {t('walletComponents.payment')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('receive')}>
                            <ThemedView backgroundColor={theme.secondary+ "20"} style={styles.actionCircle}>
                                <Download size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                {t('walletComponents.receive')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('transactions')}>
                            <ThemedView backgroundColor={theme.secondary + "20"} style={styles.actionCircle}>
                                <Bell size={20} color={theme.secondary} strokeWidth={2.5} />
                            </ThemedView>
                            <ThemedText type="caption" size={12} color={theme.text} style={{ fontWeight: '600', textAlign: 'center' }}>
                                {t('walletComponents.activity')}
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
                        onPress={() => setActiveTab('payments')}
                         style = {{...styles.tab ,
                            borderRadius: 12,
                            padding: 2,

                            backgroundColor: activeTab === 'payments' ? theme.secondary : theme.surfaceVariant}}
                    >
                        <ThemedView backgroundColor="transparent" style={styles.tabWithBadge}>
                            <ThemedText
                                type="normal"
                                intensity = "strong"
                                color={activeTab === 'payments' ? "white" : theme.text}
                                style={{ paddingHorizontal: 4}}
                            >
                                {t('walletComponents.payments')}
                            </ThemedText>
                            {ongoingActivities.length > 0 && (
                                <ThemedView
                                    style={{...styles.badge, backgroundColor:"transparent"}}
                                >
                                    <ThemedText type="caption" size={10} intensity="strong" style ={{color: "white"}} >
                                        {ongoingActivities.length}
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </TouchableOpacity>
                     <TouchableOpacity
                        // style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                        onPress={() => setActiveTab('history')}
                        style = {{...styles.tab ,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'history' ? theme.secondary : theme.surfaceVariant,}}
                    >
                        <ThemedText
                            type="normal"
                            size={14}
                            intensity = "strong"
                            color={activeTab === 'history' ? 'white' :theme.text}
                        >
                            {t('walletComponents.history')}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('services')}
                         style = {{...styles.tab,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'services' ? theme.secondary : theme.surfaceVariant,}}

                    >
                        <ThemedText
                            type="normal"
                            intensity = "strong"
                            size={14}
                            color={activeTab === 'services' ? "white": theme.text}
                        >
                            {t('walletComponents.services')}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('tokens')}
                        style={{...styles.tab,
                            borderRadius: 8,
                            padding: 4,
                            backgroundColor: activeTab === 'tokens' ? theme.secondary : theme.surfaceVariant,}}
                    >
                        <ThemedView backgroundColor="transparent" style={styles.tabWithBadge}>
                            <ThemedText
                                type="normal"
                                intensity="strong"
                                size={14}
                                color={activeTab === 'tokens' ? 'white' : theme.text}
                            >
                                Tokens
                            </ThemedText>
                            {investTokensCount > 0 && (
                                <ThemedView style={{...styles.badge, backgroundColor: 'transparent'}}>
                                    <ThemedText type="caption" size={10} intensity="strong" style={{color: 'white'}}>
                                        {investTokensCount}
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
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
                                <ThemedText type="caption" intensity = "strong" size={11} color={theme.text + "80"}>
                                    {t('walletComponents.services')}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView backgroundColor={theme.star + '15'} style={styles.summaryCard}>
                                <Calendar size={20} color={theme.star} />
                                <ThemedText type="title" size={20} color={theme.text} intensity="strong">
                                    {activitiesByType.reservations}
                                </ThemedText>
                                <ThemedText type="caption" intensity = "strong" size={11} color={theme.text + "80"}>
                                    {t('walletComponents.reservations')}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView backgroundColor={theme.error + '15'} style={styles.summaryCard}>
                                <Home size={20} color={theme.error} />
                                <ThemedText type="title" size={20} color={theme.text} intensity="strong">
                                    {activitiesByType.rents}
                                </ThemedText>
                                <ThemedText type="caption" intensity = "strong" size={11} color={theme.text + "80"}>
                                    {t('walletComponents.rents')}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        {/* Loading State */}
                        {activitiesLoading && (
                            <ThemedView backgroundColor="transparent" style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.secondary} />
                                <ThemedText type="normal" size={14} color={theme.text + "80"} style={{ marginTop: 12 }}>
                                    {t('walletComponents.loadingText')}
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
                                                <ThemedView style = {{flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 4}  }>
                                                     <ThemedText type="normal" size={15} color={theme.text} style={{ fontWeight: '600', marginBottom: 2 }} numberOfLines={1}>
                                                {activity.title}
                                                 </ThemedText>
                                                  <ThemedView backgroundColor="transparent" style={styles.activityMeta}>
                                                <ThemedView backgroundColor={getStatusColor(activity.paymentStatus) + '20'} style={styles.statusBadge}>
                                                    <ThemedText type="caption" size={10} color={getStatusColor(activity.paymentStatus)} style={{ fontWeight: '600' }}>
                                                        {activity.paymentStatus === 'unpaid' ? t('walletComponents.toPay') :
                                                         activity.paymentStatus === 'pending' ? t('walletComponents.pending') :
                                                         activity.paymentStatus === 'paid' ? t('walletComponents.paid') : activity.paymentStatus}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>

                                                </ThemedView>
                                           
                                            <ThemedText type="caption" color={theme.text} style={{ marginBottom: 4 }} numberOfLines={1}>
                                                {activity.description || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                            </ThemedText>
                                           
                                        </ThemedView>
                                    </ThemedView>
                                    <ThemedView backgroundColor="transparent" style={styles.activityRight}>
                                        <ThemedText type="normal" size={14} color={theme.text} intensity="strong">
                                            {activity.amount.toLocaleString('fr-FR')} {activity.currency}
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
                                    {t('walletComponents.noOngoingPayments')}
                                </ThemedText>
                                <ThemedText type="caption" size={12} color={theme.text} style={{ marginTop: 4, textAlign: 'center', paddingHorizontal: 32 }}>
                                    {t('walletComponents.servicesReservationsRentsHere')}
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>
                )}

                {/* Services Grid */}
                {activeTab === 'services' && (
                    <ThemedView backgroundColor="transparent" style={styles.servicesGrid}>
                        {[
                            { id: 'rent', name: t('walletComponents.rent'), icon: 'home', color: '#FF3B30' },
                            { id: 'electricity', name: t('walletComponents.electricity'), icon: 'zap', color: '#FFCC00' },
                            { id: 'internet', name: t('walletComponents.internet'), icon: 'wifi', color: '#007AFF' },
                            { id: 'water', name: t('walletComponents.water'), icon: 'droplet', color: '#5AC8FA' },
                            { id: 'shopping', name: t('walletComponents.shopping'), icon: 'shopping-bag', color: '#FF2D55' },
                            { id: 'services', name: t('walletComponents.services'), icon: 'building', color: '#34C759' }
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

                {/* Tokens d'investissement RST + SPV */}
                {activeTab === 'tokens' && (
                    <ThemedView backgroundColor="transparent" style={{ paddingHorizontal: 16 }}>
                        <TouchableOpacity
                            onPress={() => onNavigate('invest-tokens')}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                padding: 16, borderRadius: 14, borderWidth: 1,
                                borderColor: theme.secondary + '30',
                                backgroundColor: theme.secondary + '08',
                                marginBottom: 12,
                            }}
                        >
                            <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <ThemedView style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.secondary + '18', justifyContent: 'center', alignItems: 'center' }}>
                                    <TrendingUp size={20} color={theme.secondary} />
                                </ThemedView>
                                <ThemedView backgroundColor="transparent">
                                    <ThemedText type="normal" style={{ fontWeight: '700', color: theme.text }}>
                                        Mes tokens d'investissement
                                    </ThemedText>
                                    <ThemedText type="caption" style={{ color: theme.onSurface + '60', marginTop: 2 }}>
                                        RST Revenue Share · Parts SPV
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                            <ChevronRight size={20} color={theme.secondary} />
                        </TouchableOpacity>

                        {/* Borrow REC entry */}
                        <TouchableOpacity
                            onPress={() => router.push('/rec' as any)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                padding: 14, borderRadius: 14, borderWidth: 1,
                                borderColor: '#7c3aed' + '30',
                                backgroundColor: '#7c3aed' + '08',
                                marginBottom: 12,
                            }}
                        >
                            <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <ThemedView style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#7c3aed' + '18', justifyContent: 'center', alignItems: 'center' }}>
                                    <ArrowRightLeft size={20} color="#7c3aed" />
                                </ThemedView>
                                <ThemedView backgroundColor="transparent">
                                    <ThemedText type="normal" style={{ fontWeight: '700', color: '#7c3aed' }}>
                                        Emprunter des REC
                                    </ThemedText>
                                    <ThemedText type="caption" style={{ color: theme.onSurface + '60', marginTop: 2 }}>
                                        Collatéral RST/SPV · 70% LTV · Stablecoin
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                            <ChevronRight size={20} color="#7c3aed" />
                        </TouchableOpacity>

                        <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    gap: 6, height: 44, borderRadius: 22,
                                    backgroundColor: (theme as any).success ?? '#10b981',
                                }}
                                onPress={() => onNavigate('invest-rst')}
                            >
                                <ThemedText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>+ RST</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    gap: 6, height: 44, borderRadius: 22,
                                    backgroundColor: theme.secondary,
                                }}
                                onPress={() => onNavigate('invest-spv')}
                            >
                                <ThemedText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>+ SPV</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    gap: 6, height: 44, borderRadius: 22,
                                    backgroundColor: '#7c3aed',
                                }}
                                onPress={() => router.push('/rec/open' as any)}
                            >
                                <ThemedText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Vault REC</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
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
                                    style={{...styles.transactionItem, borderWidth:1, borderColor: theme.outline }}
                                    onPress={() => onNavigate(`transaction-detail-${transaction.id}`)}
                                >
                                    <ThemedView backgroundColor="transparent" style={styles.txLeft}>
                                        <ThemedView style={styles.txIconContainer}>
                                            <CheckCircle2 size={18} color={theme.success} strokeWidth={2} />
                                        </ThemedView>
                                        <ThemedView backgroundColor="transparent" style={styles.txDetails}>
                                            <ThemedText type="normal" color={theme.text} style={{ fontWeight: '600', marginBottom: 3 }}>
                                                {transaction.status === 'pending' ? 'Mined for Available Balance' : transaction.description}
                                            </ThemedText>
                                            <ThemedView style = {{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <ThemedText type="caption" color={theme.text } >
                                                {transaction.type || 'Txn ID: '}
                                            </ThemedText>
                                             <ThemedText type="caption" size={11} color={theme.text} style={{ fontFamily: 'monospace' }}>
                                                    {transaction.id.substring(0, 6)}...
                                            </ThemedText>
                                            </ThemedView>
                                            
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
                                    {t('walletComponents.noTransactionsYet')}
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>
                )}

                {/* Bouton Show more */}
                {activeTab === 'history' && transactions.length > 5 && (
                    <TouchableOpacity style={styles.showMoreButton} onPress={() => onNavigate('transactions')}>
                        <ThemedText type="normal" size={13} color={theme.secondary} style={{ fontWeight: '600' }}>
                            {t('walletComponents.showMore')}
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
        marginBottom: 10,
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
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        
    },
    content: {
        paddingTop: 12,
    },
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        gap: 6,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
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
        gap: 16,
        marginBottom: 12,
    },
    serviceCard: {
        width: (width - 66) / 3,
        padding: 8,
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
        gap: 1,

        
    },
    badge: {
        borderRadius: 10,
        paddingHorizontal:2,
        paddingVertical: 2,
        minWidth: 5,
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
