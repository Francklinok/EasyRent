import React, { useState, useEffect } from 'react';
import {
  Home,
  User,
  Settings,
  Eye,
  Heart,
  Key,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Star,
  Badge,
  Users,
  Building,
  Search,
  Filter,
  Bell,
  MessageCircle,
  FileText,
  Camera,
  Edit3,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Target,
  Briefcase,
  Shield,
  Award,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react-native';
import { TextInput, TouchableOpacity, Modal, Image, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';

import { UserProfile, UserRole, BuyerData,SellerData, 
  RenterData,OwnerData, AgentData,DeveloperData, Property, 
  UserStatistics,Activity,NotificationPreferences,PrivacySettings,PropertyViewing,
Offer, RentalHistory, Tenant,MaintenanceRequest, Document, Message,Appointment,demoUser } from '@/types/profileType';


const ProfileFile = () => {
  const [user, setUser] = useState<UserProfile>(demoUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newRoleType, setNewRoleType] = useState('');

  const { theme } = useTheme();

  // Calculer les rôles actifs
  const activeRoles = user.roles.filter(role => role.isActive);
  const inactiveRoles = user.roles.filter(role => !role.isActive);

  // Fonction pour obtenir l'icône du rôle (lucide-react-native)
  const getRoleIcon = (roleType: string) => {
    const icons: any = {
      buyer: Search,
      seller: DollarSign,
      renter: Key,
      owner: Building,
      agent: Users,
      developer: Briefcase
    };
    return icons[roleType] || User;
  };

  // Fonction pour obtenir le texte du rôle
  const getRoleText = (roleType: string) => {
    const texts: any = {
      buyer: 'Acheteur',
      seller: 'Vendeur',
      renter: 'Locataire',
      owner: 'Propriétaire',
      agent: 'Agent',
      developer: 'Promoteur'
    };
    return texts[roleType] || roleType;
  };

  // Fonction pour obtenir le badge de niveau 
  const getLevelBadge = (level: string) => {
    const badges: any = {
      beginner: { color: theme.gray100, textColor: theme.gray600, text: 'Débutant' },
      intermediate: { color: theme.blue100, textColor: theme.blue600, text: 'Intermédiaire' },
      expert: { color: theme.green100, textColor: theme.success, text: 'Expert' }, // Changed to theme.success
      professional: { color: theme.purple100, textColor: theme.purple600, text: 'Professionnel' }
    };
    return badges[level] || badges.beginner;
  };

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (roleType: string) => {
    const colors: any = {
      buyer: theme.primary,
      seller: theme.warning,
      renter: theme.secondary,
      owner: theme.info,
      agent: theme.accent,
      developer: theme.star, // Using star color for developer
    };
    return colors[roleType] || theme.subtext;
  };

  // Fonction pour basculer l'état d'un rôle
  const toggleRole = (roleType: string) => {
    setUser(prev => ({
      ...prev,
      roles: prev.roles.map(role =>
        role.type === roleType
          ? { ...role, isActive: !role.isActive }
          : role
      )
    }));
  };

  // Fonction pour ajouter un nouveau rôle
  const addRole = (roleType: string) => {
    if (roleType && !user.roles.some(role => role.type === roleType)) {
      const newRole: UserRole = {
        type: roleType as any,
        isActive: true,
        level: 'beginner',
        joinDate: new Date().toISOString().split('T')[0],
        specificData: {}
      };

      setUser(prev => ({
        ...prev,
        roles: [...prev.roles, newRole]
      }));
    }
    setNewRoleType('');
  };

  // Fonction de mise à jour générique pour les préférences de notification
  const handleNotificationPreferenceChange = (key: keyof NotificationPreferences) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: !prev.preferences.notifications[key]
        }
      }
    }));
  };

  // Fonction de mise à jour générique pour les paramètres de confidentialité
  const handlePrivacySettingChange = (key: keyof PrivacySettings) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        privacy: {
          ...prev.preferences.privacy,
          [key]: !prev.preferences.privacy[key]
        }
      }
    }));
  };

  // Composant pour afficher les statistiques de vérification (using ThemedView/Text)
  const VerificationBadge = () => {
    const verifiedCount = Object.values(user.verification).filter(value => value === true).length;
    const totalCount = Object.keys(user.verification).length;
    const percentage = (verifiedCount / totalCount) * 100;

    return (
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.success }}>
        <Shield size={16} color={theme.white} />
        <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.white }}>
          {percentage.toFixed(0)}% Vérifié
        </ThemedText>
      </ThemedView>
    );
  };

  // Composant pour afficher le niveau de confiance 
  const TrustLevel = () => {
    const trustScore = Math.round(
      (user.statistics.averageRating / 5) * 100
    );

    return (
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.info }}>
        <Award size={16} color={theme.white} />
        <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.white }}>
          {trustScore}% de confiance
        </ThemedText>
      </ThemedView>
    );
  };

  // Composant pour les documents 
  const DocumentsSection = () => {
    return (
      <ThemedView style={{ gap: 24 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Mes Documents</ThemedText>
        {user.documents.length === 0 ? (
          <ThemedView style={{ textAlign: 'center', paddingVertical: 32, backgroundColor: theme.surfaceVariant, borderRadius: 8 }}>
            <FileText size={48} color={theme.subtext} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <ThemedText style={{ color: theme.subtext }}>Aucun document téléchargé pour le moment.</ThemedText>
            <TouchableOpacity style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
              <Plus size={16} color={theme.white} />
              <ThemedText style={{ color: theme.white, fontWeight: '500' }}>
                Ajouter un document
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}>
            {user.documents.map(doc => (
              <ThemedView key={doc.id} style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <FileText size={24} color={theme.onSurface} />
                  <ThemedView>
                    <ThemedText style={{ fontWeight: '500', color: theme.text }}>{doc.name}</ThemedText>
                    <ThemedText style={{ fontSize: 13, color: theme.subtext }}>{doc.type} - Uploadé le {new Date(doc.uploadDate).toLocaleDateString()}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <ThemedText style={{ paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999, fontSize: 12, fontWeight: '500', backgroundColor: doc.status === 'approved' ? theme.success : doc.status === 'pending' ? theme.warning : theme.error, color: theme.white }}>
                    {doc.status}
                  </ThemedText>
                  <TouchableOpacity onPress={() => Linking.openURL(doc.url)}>
                    <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: '500' }}>
                      Voir
                    </ThemedText>
                  </TouchableOpacity>
                  {isEditMode && (
                    <TouchableOpacity style={{ padding: 4 }}>
                      <Trash2 size={16} color={theme.error} />
                    </TouchableOpacity>
                  )}
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  // Composant pour la section de vérification 
  const VerificationSection = () => {
    return (
      <ThemedView style={{ gap: 24 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Statut de Vérification</ThemedText>
        <ThemedView style={{ gap: 12 }}>
          {Object.entries(user.verification).map(([key, value]) => (
            <ThemedView key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.surfaceVariant, borderRadius: 8 }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {value ? (
                  <CheckCircle size={20} color={theme.success} />
                ) : (
                  <XCircle size={20} color={theme.error} />
                )}
                <ThemedText style={{ fontWeight: '500', color: theme.text, textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </ThemedText>
              </ThemedView>
              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: value ? theme.success : theme.error }}>
                {value ? 'Vérifié' : 'Non vérifié'}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        {!user.verification.identity && isEditMode && (
          <TouchableOpacity style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
            <Camera size={16} color={theme.white} />
            <ThemedText style={{ color: theme.white, fontWeight: '500' }}>
              Commencer la vérification d'identité
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.surface }}>
      {/* Header avec profil */}
      <ThemedView style={{ backgroundColor: theme.primary, shadowColor: theme.shadow.color, shadowOffset: { width: 0, height: 1 }, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.elevation.small, elevation: 1, borderBottomWidth: 1, borderBottomColor: theme.outline }}>
        <ThemedView style={{ maxWidth: 768, alignSelf: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 24 }}>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <ThemedView style={{ position: 'relative' }}>
                <Image
                  source={{ uri: user.personalInfo.avatar }}
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: theme.surface, objectFit: 'cover' }}
                />
                <ThemedView style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, backgroundColor: theme.success, borderRadius: 12, borderWidth: 2, borderColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={12} color={theme.white} />
                </ThemedView>
              </ThemedView>

              <ThemedView>
                <ThemedText style={{ fontSize: 24, fontWeight: '700', color: theme.surface }}>
                  {user.personalInfo.firstName} {user.personalInfo.lastName}
                </ThemedText>
                <ThemedText style={{ color: theme.surfaceVariant, marginBottom: 8 }}>{user.personalInfo.email}</ThemedText>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <VerificationBadge />
                  <TrustLevel />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity style={{ padding: 8 }}>
                <Bell size={20} color={theme.warning} />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8 }}>
                <MessageCircle size={20} color={theme.warning} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditMode(!isEditMode)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.accent, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Edit3 size={16} color={theme.white} />
                <ThemedText style={{ color: theme.white, fontWeight: '500' }}>
                  {isEditMode ? 'Sauvegarder' : 'Modifier'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Rôles actifs */}
      <ThemedView style={{ maxWidth: 768, alignSelf: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 24 }}>
        <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, shadowColor: theme.shadow.color, shadowOffset: { width: 0, height: 1 }, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.elevation.small, elevation: 1, padding: 24, marginBottom: 24 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: '600', color: theme.text }}>Mes Rôles Actifs</ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Picker
                selectedValue={newRoleType}
                onValueChange={(itemValue) => setNewRoleType(itemValue)}
                style={{ height: 40, width: 150, borderWidth: 1, borderColor: theme.outline, borderRadius: 8, color: theme.text }}
                itemStyle={{ color: theme.text }} // This style might not apply directly to iOS or older Android. Consider custom picker for full control.
              >
                <Picker.Item label="Ajouter un rôle" value="" />
                {['buyer', 'seller', 'renter', 'owner', 'agent', 'developer']
                  .filter(type => !user.roles.some(role => role.type === type))
                  .map(type => (
                    <Picker.Item key={type} label={getRoleText(type)} value={type} />
                  ))}
              </Picker>
              {newRoleType && (
                <TouchableOpacity
                  onPress={() => addRole(newRoleType)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.success, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Plus size={16} color={theme.white} />
                  <ThemedText style={{ color: theme.white, fontWeight: '500' }}>
                    Ajouter
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {activeRoles.map((role) => {
              const Icon = getRoleIcon(role.type);
              const levelBadge = getLevelBadge(role.level);

              return (
                <TouchableOpacity
                  key={role.type}
                  style={{ position: 'relative', backgroundColor: theme.surfaceVariant, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: theme.outline, flexBasis: '48%', // Adjust for responsive grid
                  shadowColor: theme.shadow.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.elevation.medium, elevation: 2 }}
                  onPress={() => setSelectedRole(role)}
                >
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <ThemedView style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: getRoleColor(role.type), alignItems: 'center', justifyContent: 'center', shadowColor: theme.shadow.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.elevation.large, elevation: 5 }}>
                      <Icon size={24} color={theme.white} />
                    </ThemedView>
                    <ThemedText style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 12, fontWeight: '500', backgroundColor: levelBadge.color, color: levelBadge.textColor }}>
                      {levelBadge.text}
                    </ThemedText>
                  </ThemedView>

                  <ThemedText style={{ fontWeight: '600', color: theme.text, marginBottom: 4 }}>
                    {getRoleText(role.type)}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: theme.subtext, marginBottom: 12 }}>
                    Actif depuis {new Date(role.joinDate).toLocaleDateString()}
                  </ThemedText>

                  {/* Statistiques spécifiques au rôle */}
                  <ThemedView style={{ gap: 8 }}>
                    {role.type === 'buyer' && (
                      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13 }}>
                        <ThemedText style={{ color: theme.subtext }}>Budget:</ThemedText>
                        <ThemedText style={{ fontWeight: '500', color: theme.text }}>
                          {(role.specificData as BuyerData).budget?.min.toLocaleString()} - {(role.specificData as BuyerData).budget?.max.toLocaleString()}€
                        </ThemedText>
                      </ThemedView>
                    )}

                    {role.type === 'owner' && (
                      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13 }}>
                        <ThemedText style={{ color: theme.subtext }}>Revenus/mois:</ThemedText>
                        <ThemedText style={{ fontWeight: '500', color: theme.success }}>
                          {(role.specificData as OwnerData).rentalIncome?.monthly.toLocaleString()}€
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>

                  <TouchableOpacity
                    onPress={() => toggleRole(role.type)}
                    style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.surface, shadowColor: theme.shadow.color, shadowOffset: { width: 0, height: 1 }, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.elevation.small, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ThemedView style={{ width: 12, height: 12, backgroundColor: theme.success, borderRadius: 6 }}></ThemedView>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ThemedView>
        {/* Verification and Documents sections */}
        <VerificationSection />
        <DocumentsSection />
      </ThemedView>
      {selectedRole && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedRole}
          onRequestClose={() => setSelectedRole(null)}
        >
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backdrop }}>
            <ThemedView style={{ backgroundColor: theme.surface, padding: 20, borderRadius: 10, width: '80%' }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: theme.text }}>Détails du rôle {getRoleText(selectedRole.type)}</ThemedText>
²              <ThemedText style={{ color: theme.text }}>Niveau: {selectedRole.level}</ThemedText>
              <ThemedText style={{ color: theme.text }}>Actif: {selectedRole.isActive ? 'Oui' : 'Non'}</ThemedText>
              <TouchableOpacity onPress={() => setSelectedRole(null)} style={{ marginTop: 20, backgroundColor: theme.primary, padding: 10, borderRadius: 5 }}>
                <ThemedText style={{ color: theme.white, textAlign: 'center' }}>Fermer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </ThemedView>
  );
};

export default ProfileFile;