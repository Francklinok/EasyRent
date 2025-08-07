import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity, Modal, Image, ScrollView, SafeAreaView, Dimensions, 
  TextInput, Alert, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';

const { width, height } = Dimensions.get('window');

// Enhanced Types
interface WalletData {
  balance: number;
  currency: string;
  transactions: Transaction[];
  cards: PaymentCard[];
}

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  nextBilling?: string;
  icon: string;
}

interface PropertyTransaction {
  id: string;
  type: 'buy' | 'sell' | 'rent';
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    image: string;
    type: string;
  };
  status: 'active' | 'completed' | 'cancelled';
  date: string;
  commission?: number;
}

interface PropertyService {
  id: string;
  propertyId: string;
  propertyTitle: string;
  services: {
    key: string;
    title: string;
    description: string;
    icon: string;
    included: boolean;
    subscribed: boolean;
    price: string;
  }[];
}

interface AvailableService {
  key: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}

interface UserRole {
  id: string;
  type: 'buyer' | 'seller' | 'renter' | 'owner' | 'agent' | 'developer';
  name: string;
  isActive: boolean;
  level: 'beginner' | 'intermediate' | 'expert' | 'professional';
  stats: {
    totalTransactions: number;
    successRate: number;
    rating: number;
    earnings?: number;
  };
  permissions: string[];
}

interface User {
  visitStatus: 'none' | 'Visit Scheduled' | 'Visit Accepted' | 'Visit Active';
  [key: string]: any;
}

// Demo Data
const demoUser = {
  id: '1',
  name: 'Alexandre Martin',
  email: 'alexandre.martin@example.com',
  phone: '+33 6 12 34 56 78',
  location: 'Paris, France',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  joinDate: '2023-01-15',
  isVerified: true,
  isPremium: true,
  visitStatus: 'none', // 'none' | 'Visit Scheduled' | 'Visit Accepted' | 'Visit Active'
  wallet: {
    balance: 15750.50,
    currency: 'EUR',
    transactions: [
      {
        id: '1',
        type: 'income' as const,
        amount: 2500,
        description: 'Commission vente appartement',
        date: '2024-01-15',
        category: 'Commission',
        status: 'completed' as const
      },
      {
        id: '2',
        type: 'expense' as const,
        amount: 150,
        description: 'Abonnement Premium',
        date: '2024-01-10',
        category: 'Subscription',
        status: 'completed' as const
      }
    ],
    cards: [
      {
        id: '1',
        type: 'visa' as const,
        lastFour: '4532',
        expiryDate: '12/26',
        isDefault: true
      }
    ]
  },
  roles: [
    {
      id: '1',
      type: 'agent' as const,
      name: 'Agent Immobilier',
      isActive: true,
      level: 'professional' as const,
      stats: {
        totalTransactions: 45,
        successRate: 92,
        rating: 4.8,
        earnings: 125000
      },
      permissions: ['list_property', 'manage_clients', 'view_analytics']
    },
    {
      id: '2',
      type: 'buyer' as const,
      name: 'Acheteur',
      isActive: false,
      level: 'intermediate' as const,
      stats: {
        totalTransactions: 3,
        successRate: 100,
        rating: 4.5
      },
      permissions: ['search_properties', 'make_offers']
    }
  ],
  subscriptions: [
    {
      id: '1',
      name: 'Premium Pro',
      description: 'Accès complet aux outils professionnels',
      price: 149,
      period: 'monthly' as const,
      features: ['Analytics avancées', 'Support prioritaire', 'API access', 'Listings illimités'],
      isActive: true,
      nextBilling: '2024-02-15',
      icon: 'crown'
    },
    {
      id: '2',
      name: 'Marketing Boost',
      description: 'Boostez vos annonces',
      price: 49,
      period: 'monthly' as const,
      features: ['Mise en avant', 'Photos professionnelles', 'Visite virtuelle'],
      isActive: false,
      icon: 'rocket'
    }
  ],
  propertyTransactions: [
    {
      id: '1',
      type: 'sell' as const,
      property: {
        id: '1',
        title: 'Appartement 3P - Marais',
        address: '15 Rue des Rosiers, Paris 4e',
        price: 850000,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop',
        type: 'Appartement'
      },
      status: 'completed' as const,
      date: '2024-01-10',
      commission: 25500
    }
  ],
  propertyServices: [
    {
      id: '1',
      propertyId: 'villa_1',
      propertyTitle: 'Villa Monaco - Vue Mer',
      services: [
        { key: 'concierge', title: 'Service de conciergerie', description: 'Conciergerie 24h/24', icon: 'concierge-bell', included: true, subscribed: true, price: 'Inclus' },
        { key: 'housekeeping', title: 'Ménage hebdomadaire', description: 'Service de ménage professionnel', icon: 'broom', included: false, subscribed: true, price: '200€/semaine' },
        { key: 'chef', title: 'Chef à domicile', description: 'Chef privé sur demande', icon: 'chef-hat', included: false, subscribed: false, price: '150€/repas' },
        { key: 'security', title: 'Sécurité renforcée', description: 'Surveillance 24h/24', icon: 'security', included: true, subscribed: true, price: 'Inclus' }
      ]
    }
  ],
  availableServices: [
    { key: 'maintenance', title: 'Maintenance Premium', description: 'Interventions prioritaires', icon: 'wrench', price: '99€/mois' },
    { key: 'insurance', title: 'Assurance Premium', description: 'Couverture étendue', icon: 'shield', price: '149€/mois' },
    { key: 'legal', title: 'Assistance Juridique', description: 'Conseil juridique 24h/7j', icon: 'balance-scale', price: '79€/mois' },
    { key: 'energy', title: 'Audit Énergétique', description: 'Optimisation énergétique', icon: 'leaf', price: '299€/an' }
  ]
};

// Components
const WalletCard: React.FC<{ wallet: WalletData; onPress: () => void }> = ({ wallet, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <LinearGradient
          colors={[theme.primary, theme.secondary || theme.primary + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 16,
            marginBottom: 20,
          }}
        >
          <ThemedView style={{ backgroundColor: 'transparent' }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
              <ThemedView style={{ backgroundColor: 'transparent' }}>
                <ThemedText style={{ color: 'white', fontSize: 14, opacity: 0.8 }}>
                  Solde disponible
                </ThemedText>
                <ThemedText style={{ color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 }}>
                  {wallet.balance.toLocaleString('fr-FR', { style: 'currency', currency: wallet.currency })}
                </ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="wallet" size={32} color="white" style={{ opacity: 0.8 }} />
            </ThemedView>
            
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, backgroundColor: 'transparent' }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
                <ThemedText style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
                  Recharger
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
                <ThemedText style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
                  Transférer
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </LinearGradient>
      </MotiView>
    </TouchableOpacity>
  );
};

const RoleSwitcher: React.FC<{ 
  roles: UserRole[]; 
  activeRole: UserRole; 
  onRoleChange: (role: UserRole) => void 
}> = ({ roles, activeRole, onRoleChange }) => {
  const { theme } = useTheme();
  
  return (
    <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
        Mes Rôles
      </ThemedText>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => onRoleChange(role)}
              activeOpacity={0.8}
            >
              <MotiView
                animate={{
                  scale: activeRole.id === role.id ? 1.05 : 1,
                  backgroundColor: activeRole.id === role.id ? theme.primary : theme.surface,
                }}
                transition={{ type: 'spring', damping: 15 }}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: activeRole.id === role.id ? theme.primary : theme.outline + '30',
                  minWidth: 120,
                  alignItems: 'center',
                  shadowColor: theme.shadowColor || '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <MaterialCommunityIcons 
                  name={getRoleIcon(role.type)} 
                  size={24} 
                  color={activeRole.id === role.id ? 'white' : theme.primary} 
                />
                <ThemedText style={{ 
                  marginTop: 8, 
                  fontWeight: '600', 
                  fontSize: 12,
                  color: activeRole.id === role.id ? 'white' : theme.typography.body,
                  textAlign: 'center'
                }}>
                  {role.name}
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: 10, 
                  color: activeRole.id === role.id ? 'white' : theme.typography.caption,
                  marginTop: 2
                }}>
                  {role.level}
                </ThemedText>
              </MotiView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const SubscriptionCard: React.FC<{ 
  subscription: Subscription; 
  onSubscribe: () => void; 
  onCancel: () => void 
}> = ({ subscription, onSubscribe, onCancel }) => {
  const { theme } = useTheme();
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: subscription.isActive ? 2 : 1,
        borderColor: subscription.isActive ? theme.primary : theme.outline + '30',
        shadowColor: theme.shadowColor || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'transparent' }}>
        <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
            <MaterialCommunityIcons name={subscription.icon as any} size={24} color={theme.primary} />
            <ThemedText style={{ fontSize: 18, fontWeight: '700', marginLeft: 8, color: theme.typography.body }}>
              {subscription.name}
            </ThemedText>
            {subscription.isActive && (
              <ThemedView style={{ 
                backgroundColor: theme.success, 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                borderRadius: 12, 
                marginLeft: 8 
              }}>
                <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                  ACTIF
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          <ThemedText style={{ color: theme.typography.caption, marginTop: 4, marginBottom: 12 }}>
            {subscription.description}
          </ThemedText>
          
          <ThemedView style={{ backgroundColor: 'transparent' }}>
            {subscription.features.map((feature, index) => (
              <ThemedView key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name="check-circle" size={16} color={theme.success} />
                <ThemedText style={{ marginLeft: 8, fontSize: 12, color: theme.typography.body }}>
                  {feature}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
          <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.primary }}>
            {subscription.price}€
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
            /{subscription.period === 'monthly' ? 'mois' : 'an'}
          </ThemedText>
          
          <TouchableOpacity
            onPress={subscription.isActive ? onCancel : onSubscribe}
            style={{
              backgroundColor: subscription.isActive ? theme.error : theme.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              marginTop: 12,
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
              {subscription.isActive ? 'Annuler' : 'S\'abonner'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </MotiView>
  );
};

const PropertyServicesCard: React.FC<{ propertyService: any }> = ({ propertyService }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.outline + '20',
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <ThemedView style={{ backgroundColor: 'transparent' }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.typography.body }}>
            {propertyService.propertyTitle}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginTop: 2 }}>
            {propertyService.services.filter((s: any) => s.subscribed).length} services actifs
          </ThemedText>
        </ThemedView>
        <MaterialCommunityIcons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={theme.primary} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <ThemedView style={{ marginTop: 16, backgroundColor: 'transparent' }}>
          {propertyService.services.map((service: any) => (
            <ThemedView key={service.key} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.outline + '10',
              backgroundColor: 'transparent'
            }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name={service.icon as any} size={20} color={theme.primary} />
                <ThemedView style={{ marginLeft: 12, flex: 1, backgroundColor: 'transparent' }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    {service.price}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={{ 
                backgroundColor: service.subscribed ? theme.success + '20' : theme.outline + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <ThemedText style={{ 
                  fontSize: 10, 
                  fontWeight: '600',
                  color: service.subscribed ? theme.success : theme.typography.caption
                }}>
                  {service.subscribed ? 'ACTIF' : 'INACTIF'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </MotiView>
  );
};

const AvailableServiceCard: React.FC<{ service: any }> = ({ service }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 12,
        width: (width - 56) / 2,
        borderWidth: 1,
        borderColor: theme.outline + '20',
        shadowColor: theme.shadowColor || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <MaterialCommunityIcons name={service.icon as any} size={24} color={theme.primary} style={{ marginBottom: 8 }} />
      <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body, marginBottom: 4 }}>
        {service.title}
      </ThemedText>
      <ThemedText style={{ fontSize: 11, color: theme.typography.caption, marginBottom: 8 }}>
        {service.description}
      </ThemedText>
      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
        {service.price}
      </ThemedText>
      
      <ThemedView style={{
        backgroundColor: theme.primary,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
      }}>
        <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
          S'abonner
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

const TransactionItem: React.FC<{ transaction: PropertyTransaction }> = ({ transaction }) => {
  const { theme } = useTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'active': return theme.primary;
      case 'cancelled': return theme.error;
      default: return theme.typography.caption;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return 'home-plus';
      case 'sell': return 'home-minus';
      case 'rent': return 'key';
      default: return 'home';
    }
  };
  
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.outline + '20',
      }}
    >
      <Image
        source={{ uri: transaction.property.image }}
        style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
      />
      
      <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.typography.body }}>
          {transaction.property.title}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginTop: 2 }}>
          {transaction.property.address}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, fontWeight: '700', color: theme.primary, marginTop: 4 }}>
          {transaction.property.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
        <MaterialCommunityIcons 
          name={getTypeIcon(transaction.type) as any} 
          size={24} 
          color={theme.primary} 
        />
        <ThemedView style={{ 
          backgroundColor: getStatusColor(transaction.status) + '20', 
          paddingHorizontal: 8, 
          paddingVertical: 2, 
          borderRadius: 8, 
          marginTop: 4 
        }}>
          <ThemedText style={{ 
            color: getStatusColor(transaction.status), 
            fontSize: 10, 
            fontWeight: '600' 
          }}>
            {transaction.status.toUpperCase()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </MotiView>
  );
};

const getRoleIcon = (type: string) => {
  const icons: Record<string, string> = {
    buyer: 'account-search',
    seller: 'home-export',
    renter: 'key-variant',
    owner: 'home-account',
    agent: 'account-tie',
    developer: 'office-building'
  };
  return icons[type] || 'account';
};

const getVisitStatusColor = (status: string) => {
  switch (status) {
    case 'Visit Scheduled': return '#FF9500';
    case 'Visit Accepted': return '#34C759';
    case 'Visit Active': return '#007AFF';
    default: return '#6B7280';
  }
};

const getVisitStatusIcon = (status: string) => {
  switch (status) {
    case 'Visit Scheduled': return 'calendar-clock';
    case 'Visit Accepted': return 'calendar-check';
    case 'Visit Active': return 'calendar-star';
    default: return 'calendar';
  }
};

// Main Component
const EnhancedProfileComponent: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(demoUser);
  const [activeRole, setActiveRole] = useState(user.roles[0]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Update visit status function
  const updateVisitStatus = (newStatus: string) => {
    setUser(prev => ({ ...prev, visitStatus: newStatus }));
  };
  
  // Expose function globally for other components to use
  React.useEffect(() => {
    (global as any).updateProfileVisitStatus = updateVisitStatus;
    return () => {
      delete (global as any).updateProfileVisitStatus;
    };
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.primary + '20', theme.background]}
          style={{ paddingBottom: 20 }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'transparent' }}>
            <BackButton />
            <ThemedView style={{ flex: 1, alignItems: 'center', backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontSize: 20, fontWeight: '800', color: theme.typography.body }}>
                Mon Profil
              </ThemedText>
            </ThemedView>
            <TouchableOpacity>
              <MaterialCommunityIcons name="cog" size={24} color={theme.typography.body} />
            </TouchableOpacity>
          </ThemedView>
          
          {/* Profile Info */}
          <ThemedView style={{ alignItems: 'center', paddingHorizontal: 16, backgroundColor: 'transparent' }}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Image
                source={{ uri: user.avatar }}
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 50, 
                  borderWidth: 4, 
                  borderColor: theme.primary 
                }}
              />
              {user.isVerified && (
                <ThemedView style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  backgroundColor: theme.success, 
                  borderRadius: 12, 
                  padding: 4 
                }}>
                  <MaterialCommunityIcons name="check" size={16} color="white" />
                </ThemedView>
              )}
            </MotiView>
            
            <ThemedText style={{ fontSize: 24, fontWeight: '800', marginTop: 12, color: theme.typography.body }}>
              {user.name}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.typography.caption, marginTop: 4 }}>
              {user.location}
            </ThemedText>
            
            <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8, backgroundColor: 'transparent' }}>
              {user.isPremium && (
                <ThemedView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: theme.primary + '20', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 16
                }}>
                  <MaterialCommunityIcons name="crown" size={16} color={theme.primary} />
                  <ThemedText style={{ marginLeft: 4, color: theme.primary, fontWeight: '600', fontSize: 12 }}>
                    Membre Premium
                  </ThemedText>
                </ThemedView>
              )}
              
              {user.visitStatus !== 'none' && (
                <ThemedView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: getVisitStatusColor(user.visitStatus) + '20', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 16
                }}>
                  <MaterialCommunityIcons 
                    name={getVisitStatusIcon(user.visitStatus)} 
                    size={16} 
                    color={getVisitStatusColor(user.visitStatus)} 
                  />
                  <ThemedText style={{ 
                    marginLeft: 4, 
                    color: getVisitStatusColor(user.visitStatus), 
                    fontWeight: '600', 
                    fontSize: 12 
                  }}>
                    {user.visitStatus}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        </LinearGradient>
        
        {/* Wallet Card */}
        <WalletCard wallet={user.wallet} onPress={() => setShowWalletModal(true)} />
        
        {/* Role Switcher */}
        <RoleSwitcher 
          roles={user.roles} 
          activeRole={activeRole} 
          onRoleChange={setActiveRole} 
        />
        
        {/* Role Stats */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Statistiques - {activeRole.name}
          </ThemedText>
          
          <ThemedView style={{ 
            backgroundColor: theme.surface, 
            borderRadius: 16, 
            padding: 16,
            shadowColor: theme.shadowColor || '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedView style={{ alignItems: 'center', flex: 1 }}>
                <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.primary }}>
                  {activeRole.stats.totalTransactions}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center' }}>
                  Transactions
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={{ alignItems: 'center', flex: 1 }}>
                <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.success }}>
                  {activeRole.stats.successRate}%
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center' }}>
                  Taux de réussite
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={{ alignItems: 'center', flex: 1 }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.star }}>
                    {activeRole.stats.rating}
                  </ThemedText>
                  <MaterialCommunityIcons name="star" size={20} color={theme.star} style={{ marginLeft: 4 }} />
                </ThemedView>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center' }}>
                  Note moyenne
                </ThemedText>
              </ThemedView>
              
              {activeRole.stats.earnings && (
                <ThemedView style={{ alignItems: 'center', flex: 1 }}>
                  <ThemedText style={{ fontSize: 20, fontWeight: '800', color: theme.primary }}>
                    {(activeRole.stats.earnings / 1000).toFixed(0)}K€
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center' }}>
                    Revenus
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* Subscriptions */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Mes Abonnements
          </ThemedText>
          
          {user.subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onSubscribe={() => Alert.alert('Abonnement', `S'abonner à ${subscription.name}`)}
              onCancel={() => Alert.alert('Annulation', `Annuler ${subscription.name}`)}
            />
          ))}
        </ThemedView>
        
        {/* Property Transactions */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Mes Transactions Immobilières
          </ThemedText>
          
          {user.propertyTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ThemedView>
        
        {/* Property Services */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Services de mes Propriétés
          </ThemedText>
          
          {user.propertyServices.map((propertyService) => (
            <PropertyServicesCard key={propertyService.id} propertyService={propertyService} />
          ))}
        </ThemedView>
        
        {/* Available Services */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Services Disponibles
          </ThemedText>
          
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {user.availableServices.map((service) => (
              <AvailableServiceCard key={service.key} service={service} />
            ))}
          </ThemedView>
        </ThemedView>
        
        {/* Quick Actions */}
        <ThemedView style={{ marginHorizontal: 16, marginBottom: 40 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.typography.body }}>
            Actions Rapides
          </ThemedText>
          
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              { icon: 'home-plus', label: 'Ajouter Propriété', color: theme.primary },
              { icon: 'account-group', label: 'Mes Clients', color: theme.secondary },
              { icon: 'chart-line', label: 'Analytics', color: theme.success },
              { icon: 'message-text', label: 'Messages', color: theme.star },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  width: (width - 56) / 2,
                  shadowColor: theme.shadowColor || '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <MaterialCommunityIcons name={action.icon as any} size={32} color={action.color} />
                <ThemedText style={{ marginTop: 8, fontSize: 12, fontWeight: '600', textAlign: 'center', color: theme.typography.body }}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EnhancedProfileComponent;