import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity, Modal, Image, ScrollView, SafeAreaView, Dimensions, 
  RefreshControl, 
} from 'react-native';
import { MotiView, MotiText } from 'moti';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { useBooking } from '../contexts/booking/BookingContext';
import { useNotifications } from '../contexts/notifications/NotificationContext';
import { useActivity } from '../contexts/activity/ActivityContext';
import { useUser } from '../contexts/user/UserContext';

const { width } = Dimensions.get('window');

interface ContactInfo {
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  location: string;
  identityVerified: boolean;
}

interface TrustScore {
  rating: number;
  reviewCount: number;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  verificationBadges: string[];
}

interface UserStats {
  propertiesListed: number;
  transactionsCompleted: number;
  averageRating: number;
  responseTime: string;
  lastActive: string;
}

const ProfileComponent: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser(); // Using your useUser hook
  const { getUserReservations, getOwnerReservations } = useBooking();
  const { notifications } = useNotifications();
  const { getUserActivities } = useActivity();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [ownerReservations, setOwnerReservations] = useState([]);
  const [userActivities, setUserActivities] = useState([]);

  // Load user data
  useEffect(() => {
    if (user?.id) {
      const userBookings = getUserReservations(user.id);
      const ownerBookings = getOwnerReservations(user.id);
      const activities = getUserActivities(user.id);
      
      setUserReservations(userBookings);
      setOwnerReservations(ownerBookings);
      setUserActivities(activities);
    }
  }, [user?.id, getUserReservations, getOwnerReservations, getUserActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh user data
    setTimeout(() => setRefreshing(false), 2000);
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

  const getUserTypeIcon = (userType: string) => {
    const icons = {
      tenant: 'key-variant',
      landlord: 'home-account',
      agent: 'account-tie',
      developer: 'office-building',
      buyer: 'account-search',
      seller: 'home-export'
    };
    return icons[userType as keyof typeof icons] || 'account';
  };

 
  const renderStatsCard = () => (
    <ThemedView style={{
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 1,
      marginBottom: 6,
   
    }}>
      <ThemedText type = "body" style={{  marginBottom: 16, color: theme.typography.body }}>
        Statistiques de Performance
      </ThemedText>
      
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedView  style={{ alignItems: 'center', flex: 1 }}>
          <ThemedText type = "subtitle"  intensity='strong' style={{color: theme.primary }}>
            {userReservations.length + ownerReservations.length}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center', marginTop: 4 }}>
            Transactions
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={{ alignItems: 'center', flex: 1 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText type = "subtitle"  intensity='strong' style={{   color: theme.star }}>
              {user?.rating || 0}
            </ThemedText>
            <MaterialCommunityIcons name="star" size={20} color={theme.star} style={{ marginLeft: 4 }} />
          </ThemedView>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center', marginTop: 4 }}>
            Note moyenne
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={{ alignItems: 'center', flex: 1 }}>
          <ThemedText type = "subtitle"  intensity='strong' style={{ color: theme.success }}>
            {user?.responseTime || '2h'}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption, textAlign: 'center', marginTop: 4 }}>
            Temps de réponse
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderContactInfo = () => (
    <ThemedView style={{
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginHorizontal: 4,
      marginBottom: 6,
    }}>
      {/* <ThemedText type = "body" style={{  marginBottom: 16, color: theme.typography.body }}>
        Informations de Contact
      </ThemedText> */}
      
      {/* Phone */}
       {user.phone?
       <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <ThemedView style={{ 
          backgroundColor: theme.primary + '20', 
          borderRadius: 8, 
          padding: 8, 
          marginRight: 12 
        }}>
          <MaterialCommunityIcons name="phone" size={20} color={theme.primary} />
        </ThemedView>
       
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
            {user?.phone || 'Non renseigné'}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
            Téléphone
          </ThemedText>
        </ThemedView>
        {user?.phoneVerified && (
          <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} />
        )}
      </ThemedView>:""
        }
      
      
      {/* Email */}
      {user?.email?
       <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <ThemedView style={{ 
          backgroundColor: theme.secondary + '20', 
          borderRadius: 8, 
          padding: 8, 
          marginRight: 12 
        }}>
          <MaterialCommunityIcons name="email" size={20} color={theme.secondary} />
        </ThemedView>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
            {user?.email || 'Non renseigné'}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
            Adresse email
          </ThemedText>
        </ThemedView>
        {user?.isEmailVerified && (
          <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} />
        )}
      </ThemedView>:""
      }
     
      
      {/* Location */}
      {user.location?
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ThemedView style={{ 
          backgroundColor: theme.star + '20', 
          borderRadius: 8, 
          padding: 8, 
          marginRight: 12 
        }}>
          <MaterialCommunityIcons name="map-marker" size={20} color={theme.star} />
        </ThemedView>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
            {user?.location || 'Non renseigné'}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
            Localisation
          </ThemedText>
        </ThemedView>
      </ThemedView>:""
      }
      
    </ThemedView>
  );

  const renderRecentActivity = () => (
    <ThemedView style={{
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 10,
      marginHorizontal: 16,
      marginBottom: 6,
    }}>
      <ThemedText type = "body" style={{ marginBottom: 16, color: theme.typography.body }}>
        Activité Récente
      </ThemedText>
      
      {userActivities.length === 0 ? (
        <ThemedView style={{ alignItems: 'center', paddingVertical: 2 }}>
          <MaterialCommunityIcons name="timeline-clock" size={18} color={theme.typography.caption} />
          <ThemedText style={{ fontSize: 14, color: theme.typography.caption, marginTop: 8 }}>
            Aucune activité récente
          </ThemedText>
        </ThemedView>
      ) : (
        userActivities.slice(0, 3).map((activity, index) => (
          <ThemedView key={activity.id || index} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: index < 2 ? 12 : 0,
            paddingBottom: index < 2 ? 12 : 0,
            borderBottomWidth: index < 2 ? 1 : 0,
            borderBottomColor: theme.outline + '20'
          }}>
            <ThemedView style={{ 
              backgroundColor: theme.primary + '20', 
              borderRadius: 8, 
              padding: 6, 
              marginRight: 12 
            }}>
              <MaterialCommunityIcons name="timeline" size={16} color={theme.primary} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.typography.body }}>
                {activity.title || 'Activité'}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('fr-FR') : 'Récemment'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))
      )}
    </ThemedView>
  );

  
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="loading" size={48} color={theme.primary} />
        <ThemedText type = "body" style={{ marginTop: 16, color: theme.typography.caption }}>
          Chargement du profil...
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 6 }}>
          <BackButton />
          <ThemedView style={{ flex: 1, alignItems: 'center' }}>
          </ThemedView>
          <TouchableOpacity onPress={() => setShowContactModal(true)}>
            <MaterialCommunityIcons name="card-account-details" size={22} color={theme.typography.body} />
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Header */}
        <ThemedView>
          <ThemedView style={{ alignItems: 'center', paddingHorizontal: 16, backgroundColor: 'transparent' }}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{ position: 'relative' }}
            >
              <Image
                source={{ uri: user.photo }}
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 50, 
                  borderWidth: 1, 
                  borderColor: theme.outline 
                }}
              />
              
              {/* Trust Level Badge */}
              <ThemedView style={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                backgroundColor: getTrustBadgeColor(user.trustLevel || 'bronze'),
                borderRadius: 12, 
                padding: 4,
                borderWidth: 2,
                borderColor: 'white'
              }}>
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={16} 
                  color={theme.blue50}
                />
              </ThemedView>
            </MotiView>
            
            <ThemedText type = "subtitle" style={{ marginTop: 12, color: theme.typography.body }}>
              {user.firstName}
            </ThemedText>
            
            {/* User Type & Status */}
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons 
                name={getUserTypeIcon(user?.role)} 
                size={16} 
                color={theme.primary} 
              />
              <ThemedText style={{ marginLeft: 4, color: theme.primary }}>
                {user.role === 'client' ? 'Utilisateur' : 
                 user.role === 'landlord' ? 'Propriétaire' :
                 user.role === 'agent' ? 'Agent' : 'Utilisateur'}
              </ThemedText>
            </ThemedView>
            
            <ThemedText style={{ color: theme.typography.caption, marginTop: 4 }}>
              {user?.location}
            </ThemedText>
            
            {/* Badges */}
            <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 2, backgroundColor: 'transparent' }}>
              {user.isPremium && (
                <ThemedView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: theme.primary + '20', 
                  paddingHorizontal: 10, 
                  paddingVertical: 6, 
                  borderRadius: 12
                }}>
                  <MaterialCommunityIcons name="crown" size={14} color={theme.primary} />
                  <ThemedText style={{ marginLeft: 4, color: theme.primary, fontWeight: '600', fontSize: 12 }}>
                    Premium
                  </ThemedText>
                </ThemedView>
              )}
              
              {user.isEmailVerified&& (
                <ThemedView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: theme.success + '20', 
                  paddingHorizontal: 10, 
                  paddingVertical: 6, 
                  borderRadius: 12
                }}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color={theme.success} />
                  <ThemedText style={{ marginLeft: 4, color: theme.success, fontWeight: '600', fontSize: 12 }}>
                    Vérifié
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Content Sections */}
        {renderContactInfo()}

        {/* {renderVerificationStatus()} */}
        {renderStatsCard()}

        {renderRecentActivity()}
        
      </ScrollView>

    </SafeAreaView>
  );
};

export default ProfileComponent;