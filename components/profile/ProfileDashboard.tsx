import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity, Image, Dimensions, RefreshControl, Alert
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { ThemedScrollView } from '../ui/ScrolleView';
import { useTheme } from '../contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { useBooking } from '../contexts/booking/BookingContext';
import { useNotifications } from '../contexts/notifications/NotificationContext';
import { useActivity } from '../contexts/activity/ActivityContext';
import { useUser } from '../contexts/user/UserContext';
import { router } from 'expo-router';
import ActivityTracker from '../activity/ActivityTracker';

const { width } = Dimensions.get('window');

interface ProfileStats {
  totalTransactions: number;
  walletBalance: number;
  cryptoValue: number;
  propertiesCount: number;
  favoritesCount: number;
  totalEarnings: number;
  premiumDaysLeft: number;
  verificationLevel: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  description: string;
  premium?: boolean;
}

const ProfileDashboard: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser();
  const { getUserReservations, getOwnerReservations } = useBooking();
  const { notifications, unreadCount } = useNotifications();
  const { getUserActivities } = useActivity();

  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [userReservations, setUserReservations] = useState([]);
  const [ownerReservations, setOwnerReservations] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalTransactions: 0,
    walletBalance: 15750.50,
    cryptoValue: 8945.23,
    propertiesCount: 0,
    favoritesCount: 0,
    totalEarnings: 45230.80,
    premiumDaysLeft: 23,
    verificationLevel: 75
  });

  const quickActions: QuickAction[] = [
    {
      id: 'wallet',
      title: 'Portefeuille',
      icon: 'wallet',
      color: theme.primary,
      route: '/wallet/Wallet',
      description: 'Gérer vos finances'
    },
    {
      id: 'crypto',
      title: 'Crypto',
      icon: 'bitcoin',
      color: '#F7931A',
      route: '/wallet/Wallet',
      description: 'Trading crypto'
    },
    {
      id: 'premium',
      title: 'Premium',
      icon: 'crown',
      color: '#FFD700',
      route: '/premium/Premium',
      description: 'Débloquer les fonctionnalités',
      premium: true
    },
    {
      id: 'inventory',
      title: 'Inventaire',
      icon: 'home-city',
      color: theme.success,
      route: '/inventory/Inventory',
      description: 'Mes propriétés'
    },
    {
      id: 'favorites',
      title: 'Favoris',
      icon: 'heart',
      color: theme.star,
      route: '/favoris/Favoris',
      description: 'Propriétés sauvegardées'
    },
    {
      id: 'params',
      title: 'Paramètres',
      icon: 'cog',
      color: theme.outline,
      route: '/params/params',
      description: 'Configuration'
    }
  ];

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = () => {
    if (user?.id) {
      const userBookings = getUserReservations(user.id);
      const ownerBookings = getOwnerReservations(user.id);
      const activities = getUserActivities(user.id);

      setUserReservations(userBookings);
      setOwnerReservations(ownerBookings);
      setUserActivities(activities);

      // Update profile stats
      setProfileStats(prev => ({
        ...prev,
        totalTransactions: userBookings.length + ownerBookings.length,
        propertiesCount: ownerBookings.length,
        favoritesCount: 12 // This should come from favorites context
      }));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getVerificationColor = (level: number) => {
    if (level >= 80) return theme.success;
    if (level >= 60) return theme.warning;
    return theme.error;
  };

  const getTrustBadgeColor = (level: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[level as keyof typeof colors] || colors.bronze;
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[theme.primary, theme.secondary || theme.primary + '80']}
      style={{
        paddingHorizontal: 20,
        paddingTop: insets.top + 10,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
      }}
    >
      {/* Header Actions */}
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 20
      }}>
        <BackButton color="white" />
        <ThemedView style={{ flexDirection: 'row', gap: 15, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={() => router.push('/chat/ChatList')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="chat" size={20} color="white" />
            {unreadCount > 0 && (
              <ThemedView style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: theme.error,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {unreadCount}
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection('settings')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="cog" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Profile Info */}
      <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ position: 'relative', marginBottom: 15 }}
        >
          <Image
            source={{ uri: user?.photo || 'https://via.placeholder.com/120' }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 4,
              borderColor: 'white'
            }}
          />

          {/* Trust Level Badge */}
          <ThemedView style={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            backgroundColor: getTrustBadgeColor(user?.trustLevel || 'bronze'),
            borderRadius: 15,
            padding: 6,
            borderWidth: 2,
            borderColor: 'white'
          }}>
            <MaterialCommunityIcons
              name="shield-check"
              size={18}
              color="white"
            />
          </ThemedView>

          {/* Online Status */}
          <ThemedView style={{
            position: 'absolute',
            top: 5,
            right: 5,
            backgroundColor: theme.success,
            borderRadius: 10,
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: 'white'
          }} />
        </MotiView>

        <ThemedText style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 5
        }}>
          {user?.firstName} {user?.lastName}
        </ThemedText>

        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 15,
          marginBottom: 10
        }}>
          <MaterialCommunityIcons
            name={user?.role === 'landlord' ? 'home-account' : 'account'}
            size={16}
            color="white"
          />
          <ThemedText style={{ color: 'white', marginLeft: 5, fontWeight: '600' }}>
            {user?.role === 'landlord' ? 'Propriétaire' : 'Locataire'}
          </ThemedText>
        </ThemedView>

        {/* Badges */}
        <ThemedView style={{
          flexDirection: 'row',
          gap: 10,
          backgroundColor: 'transparent'
        }}>
          {user?.isPremium && (
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,215,0,0.9)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <MaterialCommunityIcons name="crown" size={14} color="white" />
              <ThemedText style={{ color: 'white', marginLeft: 3, fontSize: 12, fontWeight: 'bold' }}>
                Premium
              </ThemedText>
            </ThemedView>
          )}

          {user?.isEmailVerified && (
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(46,204,113,0.9)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="white" />
              <ThemedText style={{ color: 'white', marginLeft: 3, fontSize: 12, fontWeight: 'bold' }}>
                Vérifié
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <ThemedView style={{ marginTop: -20, paddingHorizontal: 20 }}>
      <MotiView
        from={{ translateY: 50, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 200 }}
      >
        <BlurView intensity={20} tint="light" style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 20
        }}>
          <ThemedView style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'transparent'
          }}>
            <ThemedView style={{ alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: theme.primary }}>
                {profileStats.walletBalance.toLocaleString('fr-FR')}€
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                Solde Wallet
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#F7931A' }}>
                {profileStats.cryptoValue.toLocaleString('fr-FR')}€
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                Crypto Value
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: theme.success }}>
                {profileStats.totalTransactions}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                Transactions
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Verification Progress */}
          <ThemedView style={{ marginTop: 15, backgroundColor: 'transparent' }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
                Niveau de vérification
              </ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: getVerificationColor(profileStats.verificationLevel) }}>
                {profileStats.verificationLevel}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={{
              height: 8,
              backgroundColor: theme.outline + '30',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <MotiView
                from={{ width: 0 }}
                animate={{ width: `${profileStats.verificationLevel}%` }}
                transition={{ type: 'timing', duration: 1000, delay: 500 }}
                style={{
                  height: '100%',
                  backgroundColor: getVerificationColor(profileStats.verificationLevel),
                  borderRadius: 4
                }}
              />
            </ThemedView>
          </ThemedView>
        </BlurView>
      </MotiView>
    </ThemedView>
  );

  const renderQuickActions = () => (
    <ThemedView style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <ThemedText style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.typography.body,
        marginBottom: 15
      }}>
        Actions Rapides
      </ThemedText>

      <ThemedView style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: 'transparent'
      }}>
        {quickActions.map((action, index) => (
          <MotiView
            key={action.id}
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: index * 100 }}
            style={{ width: (width - 60) / 2, marginBottom: 15 }}
          >
            <TouchableOpacity
              onPress={() => router.push(action.route as any)}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 15,
                shadowColor: theme.shadowColor || '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
              activeOpacity={0.8}
            >
              <ThemedView style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                backgroundColor: 'transparent'
              }}>
                <ThemedView style={{
                  backgroundColor: action.color + '20',
                  borderRadius: 12,
                  padding: 8,
                  marginRight: 10
                }}>
                  <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                </ThemedView>
                {action.premium && (
                  <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                )}
              </ThemedView>

              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.typography.body,
                marginBottom: 4
              }}>
                {action.title}
              </ThemedText>

              <ThemedText style={{
                fontSize: 12,
                color: theme.typography.caption,
                lineHeight: 16
              }}>
                {action.description}
              </ThemedText>
            </TouchableOpacity>
          </MotiView>
        ))}
      </ThemedView>
    </ThemedView>
  );

  const renderRecentActivity = () => (
    <ThemedView style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'transparent'
      }}>
        <ThemedText style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.typography.body
        }}>
          Activité Récente
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/activity/ActivityCenter')}>
          <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>
            Voir tout
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 15,
        shadowColor: theme.shadowColor || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        {userActivities.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: 'transparent' }}>
            <MaterialCommunityIcons name="timeline-clock" size={48} color={theme.typography.caption} />
            <ThemedText style={{ fontSize: 16, color: theme.typography.caption, marginTop: 10 }}>
              Aucune activité récente
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.typography.caption, textAlign: 'center', marginTop: 5 }}>
              Vos transactions et interactions apparaîtront ici
            </ThemedText>
          </ThemedView>
        ) : (
          userActivities.slice(0, 3).map((activity, index) => (
            <ThemedView
              key={activity.id || index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index < 2 ? 15 : 0,
                paddingBottom: index < 2 ? 15 : 0,
                borderBottomWidth: index < 2 ? 1 : 0,
                borderBottomColor: theme.outline + '20',
                backgroundColor: 'transparent'
              }}
            >
              <ThemedView style={{
                backgroundColor: theme.primary + '20',
                borderRadius: 10,
                padding: 8,
                marginRight: 12
              }}>
                <MaterialCommunityIcons name="timeline" size={20} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
                  {activity.title || 'Activité'}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('fr-FR') : 'Récemment'}
                </ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.typography.caption} />
            </ThemedView>
          ))
        )}
      </ThemedView>
    </ThemedView>
  );

  const renderEarningsCard = () => (
    <ThemedView style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 400 }}
      >
        <LinearGradient
          colors={[theme.success, theme.success + '80']}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 10
          }}
        >
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            <ThemedView style={{ backgroundColor: 'transparent' }}>
              <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 5 }}>
                Revenus Totaux
              </ThemedText>
              <ThemedText style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                {profileStats.totalEarnings.toLocaleString('fr-FR')}€
              </ThemedText>
              <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                +12.5% ce mois
              </ThemedText>
            </ThemedView>
            <MaterialCommunityIcons name="trending-up" size={32} color="white" />
          </ThemedView>
        </LinearGradient>
      </MotiView>
    </ThemedView>
  );

  if (!user) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="loading" size={48} color={theme.primary} />
        <ThemedText style={{ marginTop: 16, color: theme.typography.caption }}>
          Chargement du profil...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      style={{ flex: 1 }}
    >
      {renderProfileHeader()}
      {renderStatsCards()}
      {renderQuickActions()}
      {renderEarningsCard()}
      {renderRecentActivity()}

      {/* Floating Activity Tracker */}
      <ActivityTracker
        userId={user?.id || 'user123'}
        position="fixed"
        onPress={() => router.push('/activity/ActivityCenter')}
      />
    </ThemedScrollView>
  );
};

export default ProfileDashboard;