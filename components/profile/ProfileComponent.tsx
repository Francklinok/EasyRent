import React, { useState, useEffect, useCallback } from 'react';
import {
  TouchableOpacity, Image, ScrollView, Dimensions,
  RefreshControl, ActivityIndicator, View, Alert, Modal,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../../hooks/themehook';
import { useAuth } from '../contexts/authContext/AuthContext';
import { useProfile, useTrustScore } from '@/hooks/useProfile';
import { getActivityService, Activity, ActivityConnection } from '@/services/api/activityService';
import { useRouter } from 'expo-router';
import { usePrivacy } from '../contexts/privacy/PrivacyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

interface NavigationItem {
  id: string;
  label: string;
  value?: string;
  icon: string;
  route: string;
}

const ProfileComponent: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { canShowEmail } = usePrivacy();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'activity' | 'contracts'>('resume');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [contracts, setContracts] = useState<Activity[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Contract termination modal state
  const [gestionVisible, setGestionVisible] = useState(false);
  const [terminationStep, setTerminationStep] = useState<'list' | 'confirm' | 'datepick' | 'warning' | 'submitting' | 'done'>('list');
  const [selectedContract, setSelectedContract] = useState<Activity | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    profile,
    stats: profileStats,
    loading: profileLoading,
    refreshProfile
  } = useProfile(user?.id || '');

  const activityService = getActivityService();

  //load user activities
  const loadUserActivities = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingActivities(true);
      const response: ActivityConnection = await activityService.getUserActivities(
        user.id,
        { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
      );
      if (response?.edges) {
        setActivities(response.edges.map(edge => edge.node));
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, [user?.id]);

  const loadUserContracts = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingContracts(true);
      const userContracts = await activityService.getUserContracts(user.id);
      setContracts(userContracts);
    } catch (error) {
      console.error('Erreur chargement contrats:', error);
    } finally {
      setLoadingContracts(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserActivities();
  }, [loadUserActivities]);

  useEffect(() => {
    if (activeTab === 'contracts') {
      loadUserContracts();
    }
  }, [activeTab, loadUserContracts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadUserActivities(), loadUserContracts()]);
    setRefreshing(false);
  }, [refreshProfile, loadUserActivities]);

  // Statistiques
  const realEstateStats = [
    {
      id: 'properties',
      value: profileStats?.propertiesCount || 0,
      label: 'Propriétés',
      icon: 'home',
      color: theme.primary
    },
    {
      id: 'reservations',
      value: profileStats?.reservationsCount || 0,
      label: 'Réservations',
      icon: 'calendar',
      color: theme.success
    },
    {
      id: 'reviews',
      value: profileStats?.reviewsCount || 0,
      label: 'Avis',
      icon: 'star',
      color: theme.warning
    },
    {
      id: 'rating',
      value: profileStats?.averageRating?.toFixed(1) || '0.0',
      label: 'Note',
      icon: 'trophy',
      color: theme.secondary
    }
  ];

  // ── Contract termination helpers ─────────────────────────────────────────

  const openGestion = useCallback(async () => {
    setTerminationStep('list');
    setSelectedContract(null);
    setEffectiveDate(new Date());
    setGestionVisible(true);
    if (!user?.id) return;
    try {
      setLoadingContracts(true);
      const userContracts = await activityService.getUserContracts(user.id);
      setContracts(userContracts);
    } catch (e) {
      console.error('Erreur chargement contrats (gestion):', e);
    } finally {
      setLoadingContracts(false);
    }
  }, [user?.id]);

  const handleSelectContractForTermination = (contract: Activity) => {
    setSelectedContract(contract);
    setEffectiveDate(new Date());
    setTerminationStep('datepick');
  };

  const handleDateConfirmed = () => {
    setTerminationStep('warning');
  };

  const handleTerminationConfirm = async () => {
    if (!selectedContract) return;
    setTerminationStep('submitting');
    try {
      await activityService.activityEnded(selectedContract.id, effectiveDate);
      setTerminationStep('done');
      if (user?.id) {
        const updated = await activityService.getUserContracts(user.id);
        console.log('Contrat résilié, contrats mis à jour:', updated);
        setContracts(updated);
      }
    } catch (err) {
      setTerminationStep('warning');
      Alert.alert('Erreur', 'La rupture du contrat a échoué. Veuillez réessayer.');
    }
  };

  const closeGestion = () => {
    setGestionVisible(false);
    setTerminationStep('list');
    setSelectedContract(null);
  };

  const activeRentalContracts = contracts.filter(
    c => c.isPayment && !c.isContratEnd && c.property && (c.property as any).actionType !== 'sell'
  );


  const renderGestionModal = () => {
    const prop = selectedContract?.property as any;
    const shortId = selectedContract ? `CTR-${selectedContract.id.slice(-6).toUpperCase()}` : '';
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    const renderList = () => (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <ThemedView style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: '#EF444415',
            alignItems: 'center', justifyContent: 'center', marginRight: 12
          }}>
            <MaterialCommunityIcons name="file-cancel-outline" size={22} color="#EF4444" />
          </ThemedView>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="normal" intensity="strong">Gestion des contrats</ThemedText>
            <ThemedText type="caption" intensity="light">Sélectionnez un bail actif à résilier</ThemedText>
          </ThemedView>
        </ThemedView>

        {loadingContracts ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={theme.primary} />
            <ThemedText type="caption" intensity="light" style={{ marginTop: 8 }}>Chargement...</ThemedText>
          </ThemedView>
        ) : activeRentalContracts.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="check-circle-outline" size={52} color={theme.success} />
            <ThemedText type="subtitle" intensity="light" style={{ marginTop: 12, textAlign: 'center' }}>
              Aucun bail actif
            </ThemedText>
            <ThemedText type="caption" intensity="light" style={{ marginTop: 4, textAlign: 'center' }}>
              Vous n'avez aucun contrat de location en cours à résilier.
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {activeRentalContracts.map((c) => {
              const p = c.property as any;
              const cId = `CTR-${c.id.slice(-6).toUpperCase()}`;
              const startDate = c.reservationDate
                ? new Date(Number(c.reservationDate)).toLocaleDateString('fr-FR')
                : new Date(Number(c.createdAt)).toLocaleDateString('fr-FR');
                console.log("the start  date  of  the  reservation  is  ", c.reservationDate)
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleSelectContractForTermination(c)}
                  style={{
                    borderRadius: 14, borderWidth: 1,
                    borderColor: theme.outline + '40',
                    padding: 14, marginBottom: 10,
                    flexDirection: 'row', alignItems: 'center',
                  }}
                >
                  <ThemedView style={{
                    width: 44, height: 44, borderRadius: 10,
                    backgroundColor: theme.primary + '15',
                    alignItems: 'center', justifyContent: 'center', marginRight: 12
                  }}>
                    <Ionicons name="home-outline" size={22} color={theme.primary} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                      {p?.title || 'Propriété'}
                    </ThemedText>
                    <ThemedText type="caption" intensity="light">
                      {cId} • Bail depuis le {startDate}
                    </ThemedText>
                    {c.amount ? (
                      <ThemedText type="caption" style={{ color: theme.primary, marginTop: 2 }}>
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: (c.currency as string) || 'XOF',
                          minimumFractionDigits: 0
                        }).format(c.amount)}/mois
                      </ThemedText>
                    ) : null}
                  </ThemedView>
                  <Ionicons name="chevron-forward" size={18} color={theme.outline} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </ThemedView>
    );


    const renderDatePick = () => (
   
      <ThemedView style={{ flex: 1, paddingBottom:4 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}

      >
        
        <TouchableOpacity
          onPress={() => setTerminationStep('list')}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.outline} />
        </TouchableOpacity>

        <ThemedView style={{
          borderRadius: 14, borderWidth: 1, borderColor: theme.outline + '30',
          padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center'
        }}>
          <ThemedView style={{
            width: 40, height: 40, borderRadius: 10,
            backgroundColor: theme.primary + '15',
            alignItems: 'center', justifyContent: 'center', marginRight: 12
          }}>
            <Ionicons name="home-outline" size={20} color={theme.primary} />
          </ThemedView>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="normal" intensity="strong" numberOfLines={1}>
              {prop?.title || 'Propriété'}
            </ThemedText>
            <ThemedText type="caption" intensity="light">{shortId}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type="normal" intensity="strong" style={{ marginBottom: 6 }}>
          Date d'effet de la résiliation
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ marginBottom: 16 }}>
          La résiliation prendra effet à la date choisie. Respectez le délai de préavis prévu dans votre contrat.
        </ThemedText>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1.5, borderColor: theme.primary + '60',
            borderRadius: 12, padding: 14, marginBottom: 20
          }}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
          <ThemedText type="normal" intensity="strong" style={{ flex: 1 }}>
            {fmtDate(effectiveDate)}
          </ThemedText>
          <Ionicons name="chevron-down" size={18} color={theme.outline} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={effectiveDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setEffectiveDate(date);
            }}
          />
        )}

        <ThemedView style={{
          borderRadius: 12, padding: 12, marginBottom: 24,
          backgroundColor: '#F59E0B15', borderWidth: 1, borderColor: '#F59E0B40',
          flexDirection: 'row'
        }}>
          <Ionicons name="information-circle-outline" size={18} color="#F59E0B"
            style={{ marginRight: 8, marginTop: 1 }} />
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText type="caption" style={{ color: '#92400E' }}>
              Assurez-vous de respecter le délai de préavis prévu dans votre contrat (généralement 1 à 3 mois).
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          onPress={handleDateConfirmed}
          style={{ backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>Continuer</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      </ThemedView>
    );

    const renderWarning = () => (
      <ThemedView style={{ flex: 1 }}>
        <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center' }}
        >
        <ThemedView style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: '#EF444420',
          alignItems: 'center', justifyContent: 'center', marginBottom: 20
        }}>
          <Ionicons name="warning-outline" size={36} color="#EF4444" />
        </ThemedView>

        <ThemedText type="subtitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 8 }}>
          Confirmer la résiliation
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', marginBottom: 24 }}>
          Vous êtes sur le point de résilier définitivement le bail suivant :
        </ThemedText>

        <ThemedView style={{
          width: '100%', borderRadius: 14, borderWidth: 1,
          borderColor: '#EF444440', backgroundColor: '#EF444408',
          padding: 16, marginBottom: 20
        }}>
          {[
            ['Propriété', prop?.title || '—'],
            ['Référence', shortId],
            ['Date d\'effet', fmtDate(effectiveDate)],
          ].map(([label, value]) => (
            <ThemedView key={label} style={{ flexDirection: 'row', marginBottom: 8, backgroundColor: 'transparent' }}>
              <ThemedText type="caption" intensity="light" style={{ width: 120 }}>{label}</ThemedText>
              <ThemedText type="caption" intensity="strong" style={{ flex: 1 }} numberOfLines={1}>{value}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={{
          width: '100%', borderRadius: 12, padding: 12, marginBottom: 28,
          backgroundColor: '#EF444410', borderWidth: 1, borderColor: '#EF444430',
          flexDirection: 'row'
        }}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444"
            style={{ marginRight: 8, marginTop: 1 }} />
          <ThemedText type="caption" style={{ color: '#991B1B', flex: 1 }}>
            Cette action est irréversible. La propriété sera remise en disponibilité à la date d'effet.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <TouchableOpacity
            onPress={() => setTerminationStep('datepick')}
            style={{
              flex: 1, borderWidth: 1.5, borderColor: theme.outline + '60',
              borderRadius: 12, paddingVertical: 14, alignItems: 'center'
            }}
          >
            <ThemedText type="normal" intensity="strong">Annuler</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTerminationConfirm}
            style={{ flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>Résilier</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        </ScrollView>

      </ThemedView>
    );

    const renderSubmitting = () => (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#EF4444" />
        <ThemedText type="normal" intensity="light" style={{ marginTop: 16 }}>Traitement en cours...</ThemedText>
        <ThemedText type="caption" intensity="light" style={{ marginTop: 4 }}>Veuillez patienter</ThemedText>
      </ThemedView>
    );

    const renderDone = () => (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedView style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: theme.success + '20',
          alignItems: 'center', justifyContent: 'center', marginBottom: 20
        }}>
          <Ionicons name="checkmark-circle-outline" size={44} color={theme.success} />
        </ThemedView>
        <ThemedText type="subtitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 8 }}>
          Résiliation confirmée
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', marginBottom: 8 }}>
          Le bail pour{' '}
          <ThemedText type="caption" intensity="strong">{prop?.title}</ThemedText>
          {' '}sera résilié le{' '}
          <ThemedText type="caption" intensity="strong">{fmtDate(effectiveDate)}</ThemedText>.
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', marginBottom: 32 }}>
          Le propriétaire a été notifié et la propriété sera remise en disponibilité à cette date.
        </ThemedText>
        <TouchableOpacity
          onPress={closeGestion}
          style={{
            backgroundColor: theme.primary, borderRadius: 12,
            paddingVertical: 14, paddingHorizontal: 40
          }}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>Fermer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );

    return (
      <Modal visible={gestionVisible} animationType="slide" transparent onRequestClose={closeGestion}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }}>
          <ThemedView style={{
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, maxHeight: '88%', minHeight: 400,
          }}>
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: theme.outline + '60',
              alignSelf: 'center', marginBottom: 20
            }} />

            {terminationStep !== 'done' && terminationStep !== 'submitting' && (
              <TouchableOpacity
                onPress={closeGestion}
                style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.outline} />
              </TouchableOpacity>
            )}

            {terminationStep === 'list'       && renderList()}
            {terminationStep === 'datepick'   && renderDatePick()}
            {terminationStep === 'warning'    && renderWarning()}
            {terminationStep === 'submitting' && renderSubmitting()}
            {terminationStep === 'done'       && renderDone()}
          </ThemedView>
        </View>
      </Modal>
    );
  };

  // Items de navigation
  const navigationItems: NavigationItem[] = [
    { id: 'properties', label: 'Propriétés', value: `${profileStats?.propertiesCount || 0} actives`, icon: 'home', route: '/inventory/Inventory' },
    { id: 'reservations', label: 'Réservations', value: `${profileStats?.reservationsCount || 0}`, icon: 'calendar', route: '/finalBooking/bookingstatus' },
    { id: 'favorites', label: 'Favoris', icon: 'heart', route: 'favoris/Favoris' },
    { id: 'Gestion', label: 'Gestion', icon: 'settings', route: '' }
  ];

  // Header
  const renderHeader = () => (
    <ThemedView style={{ alignItems: 'center', paddingTop: 2, paddingBottom: 16 }}>
      
        <ThemedView style={{ position: 'relative' }}>
          <ThemedView style={{
            padding: 3,
            borderRadius: 60,
            borderWidth: 1,
            borderColor: theme.blue600 +'80'
          }}>
            <Image
              source={{ uri: user?.avatar || profile?.photo || 'https://via.placeholder.com/100' }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48
              }}
            />
          </ThemedView>

          {/* Verification badge */}
          {profile?.isEmailVerified && (
            <ThemedView style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              backgroundColor: theme.success,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor:theme.outline
            }}>
              <Ionicons name="checkmark" size={14} color="white" />
            </ThemedView>
          )}
        </ThemedView>

      {/* name and email*/}
      <ThemedText type="title" intensity="light" style={{ marginTop: 12, fontWeight: '600' }}>
        {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
      </ThemedText>

      {canShowEmail() && (
        <ThemedText type="caption" intensity="light" style={{ marginTop: 4 }}>
          {user?.email}
        </ThemedText>
      )}
    </ThemedView>
  );

  const renderPromoBanner = () => (
    <ThemedView
      style={{ marginHorizontal: 16, marginBottom: 8 }}
    >
      <ThemedView
        style={{
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          // backgroundColor: theme.green500 + '80',
          borderWidth: 1,
          borderColor: theme.outline

        }}
      >

        <ThemedView style={{ flex: 1, backgroundColor:"transparent" }}>
          <ThemedText type="normal" intensity="strong" style={{ marginBottom: 4 }}>
            {profile?.isPremium ? 'Membre Premium Actif' : 'Passez à Premium'}
          </ThemedText>
          <ThemedText type="caption">
            {profile?.isPremium
              ? 'Profitez de tous vos avantages exclusifs'
              : 'Débloquez des fonctionnalités exclusives'}
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          onPress={() => router.push('/premium/Premium')}
          style={{
            backgroundColor: theme.green500 + '20',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20
          }}
        >
          <ThemedText type="caption" intensity="strong" style={{ color: theme.success }}>
            {profile?.isPremium ? 'Gérer' : 'Découvrir'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  // Tabs
  const renderTabs = () => (
    <ThemedView style={{
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 12,
      padding: 2
    }}>
      {[
        { id: 'resume', label: 'Résumé' },
        { id: 'activity', label: 'Activités' },
        { id: 'contracts', label: 'Contrats' }
      ].map((tab, _index) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id as 'resume' | 'activity' | 'contracts')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: activeTab === tab.id ? theme.primary +'90' : 'transparent',
            alignItems: 'center'
          }}
        >
          <ThemedText
            type="normal"
            intensity="strong"
            style={{
              color: activeTab === tab.id ? 'white' : theme.text,
            }}
          >
            {tab.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  const renderStats = () => (
   
      <ThemedView style={{
        flexDirection: 'row',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: theme.outline + '30'
      }}>
        {realEstateStats.map((stat, index) => (
          <React.Fragment key={stat.id}>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }}>
              <ThemedView style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: stat.color + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4
              }}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </ThemedView>
              <ThemedText type="subtitle" intensity="strong" style={{ color: stat.color }}>
                {stat.value}
              </ThemedText>
              <ThemedText type="caption" intensity="light" style={{ marginTop: 2 }}>
                {stat.label}
              </ThemedText>
            </TouchableOpacity>

            {index < realEstateStats.length - 1 && (
              <View style={{ width: 1, backgroundColor: theme.outline + '30', marginVertical: 8 }} />
            )}
          </React.Fragment>
        ))}
      </ThemedView>
  );

  // Navigation items
  const renderNavigationItems = () => (
    <ThemedView
      style={{ marginHorizontal: 16, marginBottom: 10, marginTop: 8 }}
    >
      <ThemedText type="normal" intensity="light" style={{ marginBottom: 8}}>
        Navigation
      </ThemedText>

      <ThemedView
       style={{
        borderRadius: 16,
        overflow: 'hidden',
        display:"flex",
        flexDirection:"row"

      }}>
        <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 4, gap: 26}}
        >
           {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => item.id === 'Gestion' ? openGestion() : router.push(item.route as any)}
            style={{
              flexDirection: 'colomn',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <ThemedView style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.primary + '25',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={item.icon as any} size={20} color={theme.primary} />
            </ThemedView>

            <ThemedView style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type="body">
                {item.label}
              </ThemedText>
              {item.value && (
                <ThemedText type="caption" intensity="light">
                  {item.value}
                </ThemedText>
              )}
            </ThemedView>
          </TouchableOpacity>
        ))}
        </ScrollView>
       
      </ThemedView>
    </ThemedView>
  );

  const renderRecentActivities = () => (
    <ThemedView
     
      style={{ marginHorizontal: 16, marginBottom: 10 }}
    >
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <ThemedText type="normal" intensity="light">
          Activités récentes
        </ThemedText>
        {activities.length > 3 && (
          <TouchableOpacity onPress={() => router.push('/activities')}>
            <ThemedText type="caption" style={{ color: theme.primary }}>Voir tout</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      
        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.outline + '50'
        }}>
          {activities.slice(0, 5).map((activity, index) => (
            <TouchableOpacity
              key={activity.id}
              style={{
                flexDirection: 'row',
                
                alignItems: 'center',
                padding: 14,
                borderBottomWidth: index < Math.min(activities.length, 5) - 1 ? 1 : 0,
                borderBottomColor: theme.outline + '20'
              }}
            >
              <Image
                source={{ uri: activity.property?.images?.[0] || 'https://via.placeholder.com/60' }}
                style={{ width: 50, height: 50, borderRadius: 10, marginRight: 12 }}
              />
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                  {activity.property?.title || 'Propriété'}
                </ThemedText>
                <ThemedText type="caption" intensity="light" numberOfLines={1}>
                  {activity.visitStatus === 'accepted' ? 'Visite confirmée' :
                   activity.reservationStatus === 'pending' ? 'En attente' : 'Transaction'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={{
                width: 10,
                height: 10,
                borderRadius: 4,
                backgroundColor: activity.visitStatus === 'accepted' ? theme.success :
                               activity.reservationStatus === 'pending' ? theme.warning : theme.success
              }} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      
    </ThemedView>
  );

  // Contracts list with download links
  const renderContracts = () => {
    const downloadContract = async (contractUrl: string, contractId: string) => {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(contractUrl, {
            mimeType: 'application/pdf',
            dialogTitle: `Contrat ${contractId}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          await Print.printAsync({ uri: contractUrl });
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le contrat');
      }
    };

    if (loadingContracts) {
      return (
        <ThemedView style={{ marginHorizontal: 16, alignItems: 'center', paddingVertical: 32 }}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="caption" intensity="light" style={{ marginTop: 8 }}>
            Chargement des contrats...
          </ThemedText>
        </ThemedView>
      );
    }

    if (contracts.length === 0) {
      return (
        <ThemedView style={{ marginHorizontal: 16, alignItems: 'center', paddingVertical: 48 }}>
          <MaterialCommunityIcons name="file-document-outline" size={56} color={theme.outline} />
          <ThemedText type="subtitle" intensity="light" style={{ marginTop: 12, textAlign: 'center' }}>
            Aucun contrat
          </ThemedText>
          <ThemedText type="caption" intensity="light" style={{ marginTop: 4, textAlign: 'center' }}>
            Vos contrats apparaîtront ici après confirmation de paiement
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={{ marginHorizontal: 16, marginBottom: 10 }}>
        <ThemedText type="normal" intensity="light" style={{ marginBottom: 12 }}>
          Mes contrats ({contracts.length})
        </ThemedText>
        <ThemedView style={{
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.outline + '30'
        }}>
          {contracts.map((contract, index) => {
            const prop = contract.property as any;
            const isRental = prop?.actionType !== 'sell';
            const contractDate = contract.contractGeneratedAt
              ? new Date(contract.contractGeneratedAt).toLocaleDateString('fr-FR')
              : new Date(contract.updatedAt).toLocaleDateString('fr-FR');
            const shortId = `CTR-${contract.id.slice(-6).toUpperCase()}`;

            return (
              <ThemedView
                key={contract.id}
                style={{
                  padding: 14,
                  borderBottomWidth: index < contracts.length - 1 ? 2 : 1,
                  borderColor: theme.outline,
                }}
              >
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedView style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: theme.green500 + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <MaterialCommunityIcons
                      name={isRental ? 'home-outline' : 'home-city-outline'}
                      size={22}
                      color= {theme.green800}
                    />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                      {prop?.title || 'Propriété'}
                    </ThemedText>
                    <ThemedText type="caption" intensity="light">
                      {isRental ? 'Contrat de bail' : 'Contrat de vente'} • {shortId}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={{
                    backgroundColor: theme.green800 + '15',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <ThemedText intensity = "strong" style={{ fontSize: 10, color: theme.green800 }}>
                      valid
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name="calendar-outline" size={12} color={theme.outline} />
                  <ThemedText type="caption" intensity="light" style={{ marginLeft: 4 }}>
                    Généré le {contractDate}
                  </ThemedText>
                  {contract.amount ? (
                    <>
                      <ThemedView style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.outline, marginHorizontal: 8 }} />
                      <ThemedText type="caption" intensity="light">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(contract.amount)}
                      </ThemedText>
                    </>
                  ) : null}
                </ThemedView>

                <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => downloadContract(contract.contractUrl!, shortId)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.green800,
                      paddingVertical: 8,
                      borderRadius: 8,
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons name="download" size={16} color="white" />
                    <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      Télécharger
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push({
                      pathname: '/contrat/ContratScreen',
                      params: {
                        activityId: contract.id,
                        paymentStatus: 'completed',
                      }
                    } as any)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: theme.green800,
                      paddingVertical: 8,
                      borderRadius: 8,
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons name="eye-outline" size={16} color={theme.green800} />
                    <ThemedText style={{ color: theme.green800, fontSize: 12, fontWeight: '600' }}>
                      Consulter
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            );
          })}
        </ThemedView>
      </ThemedView>
    );
  };

  // Earnings card
  const renderEarningsCard = () => (
    <ThemedView
      style={{ marginHorizontal: 16, marginBottom: 30 }}
    >
      <ThemedView style={{
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: theme.outline + '30'
      }}>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <ThemedText type="normal" intensity="light">Revenus totaux</ThemedText>
        </ThemedView>

        <ThemedText type="title" intensity="strong" style={{ fontSize: 32, color: theme.primary }}>
          {(profileStats?.totalEarnings || 0).toLocaleString('fr-FR')} €
        </ThemedText>

        <ThemedText type="caption" intensity="light" style={{ marginTop: 4 }}>
          Dépenses: {(profileStats?.totalSpent || 0).toLocaleString('fr-FR')} €
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );


  if (!user) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="person-outline" size={64} color={theme.outline} />
        <ThemedText type="subtitle" style={{ marginTop: 16, marginBottom: 8 }}>
          Connectez-vous
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', marginBottom: 24 }}>
          Accédez à votre profil et gérez vos propriétés
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/Auth/Login')}
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 12
          }}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
            Se connecter
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderGestionModal()}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderHeader()}
        {renderPromoBanner()}
        {renderTabs()}

        {activeTab === 'resume' ? (
          <>
            {/* {renderStats()} */}
            {renderNavigationItems()}
            {renderEarningsCard()}

            {/* DEV — Simulation paiement */}
            <TouchableOpacity
              onPress={() => router.push('/dev/SimulatePaymentScreen' as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 16,
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#FF9800',
                backgroundColor: '#FF980015',
              }}
            >
              <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FF9800" />
              <ThemedText style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
                Dev — Simuler un paiement
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : activeTab === 'activity' ? (
          renderRecentActivities()
        ) : (
          renderContracts()
        )}
      </ScrollView>
    </ThemedView>
  );
};

export default ProfileComponent;
