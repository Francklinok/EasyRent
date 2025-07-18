import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, User, Settings, Eye, Heart, Key, TrendingUp, DollarSign, MapPin,
  Calendar, Phone, Mail, Star, Badge, Users, Building, Search, Filter,
  Bell, MessageCircle, FileText, Camera, Edit3, Plus, Trash2, CheckCircle,
  XCircle, Clock, BarChart3, Target, Briefcase, Shield, Award, Zap, Sparkles,
  ChevronRight, ChevronLeft, Map, MessageSquareText, Tool, Info
} from 'lucide-react-native';
import { TextInput, TouchableOpacity, Modal, Image, Linking, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
// Import your types
import {
  UserProfile, UserRole, BuyerData, SellerData, RenterData, OwnerData, AgentData, DeveloperData, 
  Property, UserStatistics, Activity, NotificationPreferences, PrivacySettings, PropertyViewing, 
  Offer, RentalHistory, Tenant, MaintenanceRequest, Document, Message, Appointment, SavedSearch, 
  Mandate, DevelopmentProject
} from '@/types/profileType';

// --- Utility Functions ---
const getRoleText = (roleType: string) => {
  const texts: Record<string, string> = {
    buyer: 'Acheteur',
    seller: 'Vendeur',
    renter: 'Locataire',
    owner: 'Propriétaire',
    agent: 'Agent',
    developer: 'Promoteur'
  };
  return texts[roleType] || roleType.charAt(0).toUpperCase() + roleType.slice(1);
};

const getRoleIcon = (roleType: string) => {
  const icons: Record<string, any> = {
    buyer: Search,
    seller: DollarSign,
    renter: Key,
    owner: Building,
    agent: Users,
    developer: Briefcase
  };
  return icons[roleType] || User;
};

const getLevelBadgeClasses = (level: string) => {
  const classes: Record<string, string> = {
    beginner: 'bg-gray-200 text-gray-700',
    intermediate: 'bg-blue-100 text-blue-700',
    expert: 'bg-purple-100 text-purple-700',
    professional: 'bg-green-100 text-green-700'
  };
  return classes[level] || classes.beginner;
};

const getRoleIconColorClass = (roleType: string) => {
  const colorClasses: Record<string, string> = {
    buyer: 'text-primary',
    seller: 'text-secondary',
    renter: 'text-info',
    owner: 'text-blue-700',
    agent: 'text-purple-600',
    developer: 'text-blue-600'
  };
  return colorClasses[roleType] || 'text-gray-500';
};

const getRoleIconBgClass = (roleType: string) => {
  const bgClasses: Record<string, string> = {
    buyer: 'bg-blue-50',
    seller: 'bg-purple-100',
    renter: 'bg-blue-100',
    owner: 'bg-blue-50',
    agent: 'bg-purple-100',
    developer: 'bg-blue-100'
  };
  return bgClasses[roleType] || 'bg-gray-100';
};

// --- Sub-Components ---

// Revolutionary Verification Status Component
const VerificationStatus: React.FC<{ user: UserProfile; isEditMode: boolean }> = ({ user, isEditMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  const verificationItems = [
    { key: 'identity', label: 'Identité', icon: User, verified: user.verification.identity },
    { key: 'email', label: 'Email', icon: Mail, verified: user.verification.email },
    { key: 'phone', label: 'Téléphone', icon: Phone, verified: user.verification.phone },
    { key: 'address', label: 'Adresse', icon: MapPin, verified: user.verification.address },
    { key: 'income', label: 'Revenus', icon: DollarSign, verified: user.verification.income },
    { key: 'proofOfAddress', label: 'Justificatif domicile', icon: FileText, verified: user.verification.proofOfAddress },
  ];

  const verifiedCount = verificationItems.filter(item => item.verified).length;
  const totalCount = verificationItems.length;
  const percentage = Math.round((verifiedCount / totalCount) * 100);

  return (
    <ThemedView variant='surfaceVariant' className="bg-surface rounded-2xl p-5 mb-5 shadow-sm  px-4">
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <ThemedView variant='surfaceVariant' className="flex-row items-center gap-3">
          <ThemedView className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
            <Shield size={24} color = {theme.surface} />
          </ThemedView>
          <ThemedView variant='surfaceVariant'>
            <ThemedText >
              Vérification du Profil
            </ThemedText>
            <ThemedText>
              {verifiedCount}/{totalCount} éléments vérifiés ({percentage}%)
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ChevronRight 
          size={24} 
          // className={`text-on-surface-variant transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          color = {theme.surface}
        />
      </TouchableOpacity>

      {isExpanded && (
        <ThemedView variant = 'surfaceVariant' className="mt-4 pt-4 border-t border-outline">
          <ThemedView variant = 'surfaceVariant' className="grid grid-cols-2 gap-3">
            {verificationItems.map((item) => {
              const Icon = item.icon;
              return (
                <ThemedView variant = 'surfaceVariant' key={item.key} className="flex-row items-center gap-3 p-3 bg-surface-variant rounded-lg">
                  <Icon size={20} color={item.verified ? theme.success : theme.surface} />
                  <ThemedText className={`flex-1 pl-4 text-sm ${item.verified ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {item.label}
                  </ThemedText>
                  {item.verified ? (
                    <CheckCircle size={16} color = {theme.success} />
                  ) : (
                    <XCircle size={16} color = {theme.surface} />
                  )}
                </ThemedView>
              );
            })}
          </ThemedView>
          
          {user.verification.creditScore && (
            <ThemedView variant = 'surfaceVariant' className="mt-4 p-3 bg-surface-variant rounded-lg">
              <ThemedView variant = 'surfaceVariant' className="flex-row items-center justify-between">
                <ThemedText>Score de Crédit</ThemedText>
                <ThemedText>{user.verification.creditScore}</ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
};

// User Badges Component
const UserBadges: React.FC<{ user: UserProfile }> = ({ user }) => {
  const {theme} = useTheme()
  const verifiedCount = Object.values(user.verification).filter(value => value === true).length;
  const totalCount = Object.keys(user.verification).filter(key => key !== 'creditScore').length;
  const percentage = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;
  const trustScore = Math.round((user.statistics.averageRating / 5) * 100);

  return (
    <ThemedView variant = "primary" className="flex-row gap-4 mb-4 items-center ">
      <ThemedView variant = "primary" bordered className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-surface">
        <Shield size={14} color = {theme.surface} />
        <ThemedText className="text-xs font-medium text-success text-center">
          {percentage.toFixed(0)}% Vérifié
        </ThemedText>
      </ThemedView>
      <ThemedView variant = "primary" bordered className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-surface">
        <Award size={14} color = {theme.surface}  />
        <ThemedText className="text-xs font-medium text-secondary">
          {trustScore}% Confiance
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

// Role Management Component
const RoleManagement: React.FC<{
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActivePersona: React.Dispatch<React.SetStateAction<UserRole['type']>>;
  activePersona: UserRole['type'];
  onAddRole: () => void;
}> = ({ user, setUser, setActivePersona, activePersona, onAddRole }) => {
  const { theme } = useTheme();

  const toggleRoleActivity = (roleType: string) => {
    setUser(prev => ({
      ...prev,
      roles: prev.roles.map(role =>
        role.type === roleType
          ? { ...role, isActive: !role.isActive }
          : role
      )
    }));
  };

  return (
    <ThemedView  className=" rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-2">
        Mes Rôles
      </ThemedText>

      <ThemedView  className="flex-row flex-wrap gap-4">
        {user.roles.map((role) => {
          const Icon = getRoleIcon(role.type);
          // const levelBadgeClasses = getLevelBadgeClasses(role.level);
          // const iconColorClass = getRoleIconColorClass(role.type);
          const iconBgClass = getRoleIconBgClass(role.type);

          return (
            <TouchableOpacity
              key={role.type}
              onPress={() => setActivePersona(role.type)}
              className={` rounded-xl p-4 flex-1  min-w-[45%] max-w-[48%] `}
              style={{backgroundColor:role.type === activePersona?theme.surfaceVariant: theme.surface }}
            >
              <ThemedView variant = "surfaceVariant" className="flex-row items-center mb-3">
                <ThemedView variant = "surfaceVariant" className={`w-12 h-12 rounded-lg items-center justify-center ${iconBgClass}`}>
                  <Icon size={16} color = {theme.blue100} />
                </ThemedView>

                <ThemedText className = "pr-3" >
                  {role.level === 'professional' ? 'Professionnel' : 
                   role.level === 'expert' ? 'Expert' : 
                   role.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                </ThemedText>
              </ThemedView>

              <ThemedText className="text-base font-semibold text-on-surface mb-1">
                {getRoleText(role.type)}
              </ThemedText>

              <ThemedText className="text-xs text-on-surface-variant mb-3">
                Actif depuis {new Date(role.joinDate).toLocaleDateString('fr-FR')}
              </ThemedText>

              {/* Role-specific data display */}
              {role.type === 'buyer' && (
                <ThemedText className="text-xs text-on-surface-variant">
                  Budget: <ThemedText className="font-medium text-on-surface">
                    {(role.specificData as BuyerData).budget?.min?.toLocaleString('fr-FR')} - {(role.specificData as BuyerData).budget?.max?.toLocaleString('fr-FR')}€
                  </ThemedText>
                </ThemedText>
              )}
              {role.type === 'seller' && (
                <ThemedText className="text-xs text-on-surface-variant">
                  Ventes: <ThemedText className="font-medium text-on-surface">
                    {(role.specificData as SellerData).successfulSalesCount || 0}
                  </ThemedText>
                </ThemedText>
              )}
              {role.type === 'owner' && (
                <ThemedText className="text-xs text-on-surface-variant">
                  Propriétés: <ThemedText className="font-medium text-on-surface">
                    {(role.specificData as OwnerData).ownedProperties?.length || 0}
                  </ThemedText>
                </ThemedText>
              )}
              {role.type === 'agent' && (
                <ThemedText className="text-xs text-on-surface-variant">
                  Mandats actifs: <ThemedText className="font-medium text-on-surface">
                    {(role.specificData as AgentData).mandates?.filter(m => m.status === 'active').length || 0}
                  </ThemedText>
                </ThemedText>
              )}

              {/* Active/Inactive toggle */}
              <TouchableOpacity
                onPress={() => toggleRoleActivity(role.type)}
                className="absolute top-2 right-2 p-1 rounded-full"
                style={{ backgroundColor: role.isActive ? theme.successContainer : theme.errorContainer }}
              >
                {role.isActive ? (
                  <CheckCircle size={16} color = {theme.success} />
                ) : (
                  <XCircle size={16} color = {theme.error} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {/* Add Role Card */}
        
       
      </ThemedView>
       <TouchableOpacity
          onPress={onAddRole}
          className="flex-row rounded-xl p-2  pt-4 flex-1 items-center justify-center border-1 border-dashed border-outline "
        >
          <Plus size={16} color = {theme.primary}/>
          <ThemedText className="text-base font-semibold text-on-surface-variant pl-4">
            Ajouter un Rôle
          </ThemedText>
        </TouchableOpacity>
    </ThemedView>
  );
};

// Documents Section Component
const DocumentsSection: React.FC<{ user: UserProfile; isEditMode: boolean }> = ({ user, isEditMode }) => {
  const { theme } = useTheme();
  
  const getDocumentTypeText = (type: Document['type']) => {
    switch (type) {
      case 'identity': return 'Pièce d\'identité';
      case 'proofOfAddress': return 'Justificatif de domicile';
      case 'incomeStatement': return 'Justificatif de revenus';
      case 'contract': return 'Contrat';
      default: return 'Autre';
    }
  };

  return (
    <ThemedView variant = "surfaceVariant" className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-4">
        Mes Documents
      </ThemedText>

      {user.documents.length === 0 ? (
        <ThemedView variant = "surfaceVariant" className="py-10 px-5 bg-surface-variant rounded-xl items-center">
          <FileText size={48} color={theme.outline} />
          <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
            Aucun document téléchargé pour le moment.
          </ThemedText>
          <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
            <Plus size={16} className="text-on-primary" />
            <ThemedText className="text-on-primary font-medium">
              Ajouter un document
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView variant = "surfaceVariant">
          {user.documents.map(doc => (
            <ThemedView variant = "surfaceVariant" key={doc.id} className="flex-row items-center justify-between py-4 border-b border-outline last:border-b-0">
              <ThemedView variant = "surfaceVariant" className="flex-row items-center gap-3 flex-1">
                <FileText size={24} color = {theme.success} />
                <ThemedView variant = "surfaceVariant" className="flex-1">
                  <ThemedText className="text-base font-medium text-on-surface">
                    {doc.name}
                  </ThemedText>
                  <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                    {getDocumentTypeText(doc.type)} - {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView variant = "surfaceVariant" className="flex-row items-center gap-3">
                <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${
                  doc.status === 'approved' ? 'bg-success' : 
                  doc.status === 'pending' ? 'bg-secondary' : 'bg-error'
                }`}>
                  {doc.status === 'approved' ? 'Approuvé' : 
                   doc.status === 'pending' ? 'En attente' : 'Rejeté'}
                </ThemedText>

                <TouchableOpacity onPress={() => Linking.openURL(doc.url)}>
                  <ThemedText className="text-primary text-xs font-medium">
                    Voir
                  </ThemedText>
                </TouchableOpacity>

                {isEditMode && (
                  <TouchableOpacity className="p-1">
                    <Trash2 size={16} className="text-error" />
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

// Role Specific Content Component
const RoleSpecificContent: React.FC<{ user: UserProfile; activePersona: UserRole['type'] }> = ({ user, activePersona }) => {
  const { theme } = useTheme();
  const currentRoleData = user.roles.find(role => role.type === activePersona);

  if (!currentRoleData) {
    return (
      <ThemedView variant = "surfaceVariant" className="py-10 px-5 bg-surface-variant rounded-xl items-center">
        <Info size={48} color={theme.outline} />
        <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
          Veuillez sélectionner un rôle actif pour voir les détails.
        </ThemedText>
      </ThemedView>
    );
  }

  // Content based on role type
  switch (activePersona) {
    case 'buyer':
      const buyerData = currentRoleData.specificData as BuyerData;
      return (
        <ThemedView variant = "surfaceVariant" className = "py-2">
          <ThemedText>
            Mes Recherches et Visites
          </ThemedText>
          {buyerData.savedSearches && buyerData.savedSearches.length > 0 ? (
            buyerData.savedSearches.map((search, index) => (
              <ThemedView variant = "surfaceVariant" key={search.id || index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView variant = "surfaceVariant" className="flex-row items-center gap-3 flex-1">
                  <Search size={20} color = {theme.primary} />
                  <ThemedView variant = "surfaceVariant" className = "px-4">
                    <ThemedText className="text-base font-medium text-on-surface">
                      {search.name || search.location || 'Recherche sauvegardée'}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      {search.budget ? 
                        `Budget: ${search.budget.min?.toLocaleString('fr-FR')} - ${search.budget.max?.toLocaleString('fr-FR')}€` : 
                        'Budget non spécifié'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color={theme.primary} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Search size={48} color={theme.outline} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Vous n'avez pas de recherches sauvegardées.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Plus size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Commencer une recherche
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      );

    case 'seller':
      const sellerData = currentRoleData.specificData as SellerData;
      return (
        <ThemedView>
          <ThemedText className="text-base font-medium text-on-surface mb-3">
            Mes Propriétés à Vendre
          </ThemedText>
          {sellerData.listedProperties && sellerData.listedProperties.length > 0 ? (
            sellerData.listedProperties.map(property => (
              <ThemedView key={property.id} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3">
                  <Home size={20} className="text-secondary" />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {property.address}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      Prix: {property.price.toLocaleString('fr-FR')}€
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${
                  property.status === 'active' ? 'bg-success' : 
                  property.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                }`}>
                  {property.status === 'active' ? 'Actif' : 
                   property.status === 'sold' ? 'Vendue' : 'En attente'}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <DollarSign size={48} color={theme.outline} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Vous n'avez pas encore listé de propriété.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Plus size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Lister ma propriété
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      );

    // Add other role cases as needed
    default:
      return (
        <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
          <Info size={48} color={theme.outline} />
          <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
            Contenu spécifique au rôle "{activePersona}" à implémenter.
          </ThemedText>
        </ThemedView>
      );
  }
};

// Add Role Modal Component
const AddRoleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd: (roleType: string) => void;
  availableRoles: string[];
}> = ({ visible, onClose, onAdd, availableRoles }) => {
  const [selectedRoleType, setSelectedRoleType] = useState('');
  const { theme } = useTheme();

  const handleAdd = () => {
    if (selectedRoleType) {
      onAdd(selectedRoleType);
      setSelectedRoleType('');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ThemedView className="flex-row items-center justify-between p-5 border-b border-outline">
          <ThemedText className="text-xl font-bold text-on-surface">
            Ajouter un nouveau rôle
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <XCircle size={28} className="text-on-surface-variant" />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView className="p-5 flex-1">
          <ThemedView className="h-12 border border-outline rounded-lg bg-surface justify-center mb-5">
            <Picker
              selectedValue={selectedRoleType}
              onValueChange={(itemValue) => setSelectedRoleType(itemValue)}
              style={{ color: theme.onSurface }}
            >
              <Picker.Item label="Sélectionner un rôle" value="" />
              {availableRoles.map(type => (
                <Picker.Item key={type} label={getRoleText(type)} value={type} />
              ))}
            </Picker>
          </ThemedView>
          
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!selectedRoleType}
            className={`flex-row items-center justify-center gap-1.5 px-4 py-3 rounded-lg ${
              selectedRoleType ? 'bg-primary' : 'bg-gray-400'
            }`}
          >
            <Plus size={16} className="text-on-primary" />
            <ThemedText className="text-on-primary font-medium">
              Confirmer l'ajout
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
};

// --- Main Profile Screen Component ---
const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState<UserProfile>(demoUser);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePersona, setActivePersona] = useState<UserRole['type']>(user.roles[0]?.type || 'buyer');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const availableRolesToAdd = useMemo(() => {
    const allRoles = ['buyer', 'seller', 'renter', 'owner', 'agent', 'developer'];
    return allRoles.filter(type => !user.roles.some(role => role.type === type));
  }, [user.roles]);

  const handleAddRole = (roleType: string) => {
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
    setActivePersona(roleType as UserRole['type']);
    setShowAddRoleModal(false);
  };
    const insets = useSafeAreaInsets();
  

  return (
    <SafeAreaView style={{ paddingTop: insets.top + 4  }}
>
      <ScrollView className=" px-2">
        {/* Header Section */}
        <ThemedView variant = 'primary' className="flex-row items-center  gap-6  p-2">
          <BackButton/>
          <ThemedView variant = "primary" className="flex-row items-center gap-4">
            <Image
              source={{ uri: user.profilePictureUrl || 'https://via.placeholder.com/150' }}
              className="w-16 h-16 rounded-full border-2 border-primary"
            />
            <ThemedView variant = "primary">
              <ThemedText type= 'body'>
                {user.name}
              </ThemedText>
              <ThemedText>
                {user.location}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <TouchableOpacity 
            onPress={() => setIsEditMode(!isEditMode)} 
            className="p-1 rounded-full bg-surface-variant"
          >
            <Edit3 size={24} color = {theme.surface} />
          </TouchableOpacity>
        </ThemedView>

        {/* User Badges */}
        <ThemedView variant = 'primary' className="items-center rounded-b-3xl mb-4">
          <UserBadges user={user} />
        </ThemedView>
        {/* Verification Status */}
        <ThemedView  className = "px-2">
          <VerificationStatus user={user} isEditMode={isEditMode} />
        </ThemedView>

        {/* Role Management */}
        <RoleManagement
          user={user}
          setUser={setUser}
          setActivePersona={setActivePersona}
          activePersona={activePersona}
          onAddRole={() => setShowAddRoleModal(true)}
        />

        {/* Role-Specific Content */}
        <ThemedView variant = "surfaceVariant" className="bg-surface rounded-2xl p-1 px-4">
          <ThemedText >
            Contenu spécifique au rôle
          </ThemedText>
          <RoleSpecificContent user={user} activePersona={activePersona} />
        </ThemedView>

        {/* Statistics Section */}
        <ThemedView variant = "surfaceVariant" className=" rounded-2xl p-5 mt-5 mb-5 shadow-sm">
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Statistiques
          </ThemedText>
          <ThemedView variant = "surfaceVariant" className="flex-row justify-between">
            <ThemedView  className="flex-1 items-center p-3 bg-surface-variant rounded-lg mr-2">
              <ThemedText className="text-2xl font-bold text-primary">
                {user.statistics.totalViews || 0}
              </ThemedText>
              <ThemedText>
                Vues du profil
              </ThemedText>
            </ThemedView>
            <ThemedView className="flex-1 items-center p-3 bg-surface-variant rounded-lg mx-1">
              <ThemedText >
                {user.statistics.totalTransactions || 0}
              </ThemedText>
              <ThemedText >
                Transactions
              </ThemedText>
            </ThemedView>
            <ThemedView className="flex-1 items-center p-3 bg-surface-variant rounded-lg ml-2">
              <ThemedText className="text-2xl font-bold text-success">
                {user.statistics.averageRating?.toFixed(1) || '0.0'}
              </ThemedText>
              <ThemedText className="text-xs text-on-surface-variant text-center">
                Note moyenne
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Recent Activity */}
        <ThemedView variant = "surfaceVariant" className="bg-surface rounded-2xl p-5 mb-5 shadow-sm ">
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Activité récente
          </ThemedText>
          {user.recentActivity && user.recentActivity.length > 0 ? (
            user.recentActivity.slice(0, 5).map((activity, index) => (
              <ThemedView variant = "surfaceVariant" key={index} className="flex-row items-center gap-3 py-3 border-b border-outline last:border-b-0">
                <ThemedView variant = "surfaceVariant" className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  {activity.type === 'view' && <Eye size={16} color = {theme.primary} />}
                  {activity.type === 'contact' && <Phone size={16} color = {theme.primary} />}
                  {activity.type === 'offer' && <DollarSign size={16} color = {theme.primary}  />}
                  {activity.type === 'appointment' && <Calendar size={16} color = {theme.primary}  />}
                </ThemedView>
                <ThemedView variant = "surfaceVariant" className="flex-1">
                  <ThemedText className="text-sm font-medium text-on-surface">
                    {activity.description}
                  </ThemedText>
                  <ThemedText className="text-xs text-on-surface-variant">
                    {new Date(activity.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Clock size={48} color={theme.outline} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Aucune activité récente.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Documents Section */}
        <DocumentsSection user={user} isEditMode={isEditMode} />

      

        {/* Contact Information */}
        <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Informations de contact
          </ThemedText>
          
          <ThemedView className="flex-row items-center gap-3 py-3 border-b border-outline">
            <Mail size={20} className="text-on-surface-variant" />
            <ThemedText className="text-base text-on-surface">
              {user.email}
            </ThemedText>
          </ThemedView>

          <ThemedView className="flex-row items-center gap-3 py-3 border-b border-outline">
            <Phone size={20} className="text-on-surface-variant" />
            <ThemedText className="text-base text-on-surface">
              {user.phone}
            </ThemedText>
          </ThemedView>

          <ThemedView className="flex-row items-center gap-3 py-3">
            <MapPin size={20} className="text-on-surface-variant" />
            <ThemedText className="text-base text-on-surface">
              {user.location}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Professional Info (if agent or developer) */}
        {(activePersona === 'agent' || activePersona === 'developer') && (
          <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
            <ThemedText className="text-lg font-semibold text-on-surface mb-4">
              Informations professionnelles
            </ThemedText>
            
            {activePersona === 'agent' && (
              <ThemedView>
                <ThemedView className="flex-row items-center gap-3 py-3 border-b border-outline">
                  <Building size={20} className="text-on-surface-variant" />
                  <ThemedText className="text-base text-on-surface">
                    Agence immobilière
                  </ThemedText>
                </ThemedView>
                <ThemedView className="flex-row items-center gap-3 py-3 border-b border-outline">
                  <Badge size={20} className="text-on-surface-variant" />
                  <ThemedText className="text-base text-on-surface">
                    Carte professionnelle: T123456789
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {activePersona === 'developer' && (
              <ThemedView>
                <ThemedView className="flex-row items-center gap-3 py-3 border-b border-outline">
                  <Briefcase size={20} className="text-on-surface-variant" />
                  <ThemedText className="text-base text-on-surface">
                    Entreprise de promotion
                  </ThemedText>
                </ThemedView>
                <ThemedView className="flex-row items-center gap-3 py-3">
                  <Award size={20} className="text-on-surface-variant" />
                  <ThemedText className="text-base text-on-surface">
                    Certifications: ISO 9001, HQE
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Bottom Action Buttons */}
        <ThemedView className="flex-row gap-3 mb-10">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary rounded-xl">
            <MessageCircle size={20} className="text-on-primary" />
            <ThemedText className="text-on-primary font-semibold">
              Contacter
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-secondary rounded-xl">
            <Star size={20} className="text-on-secondary" />
            <ThemedText className="text-on-secondary font-semibold">
              Évaluer
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      {/* Add Role Modal */}
      <AddRoleModal
        visible={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onAdd={handleAddRole}
        availableRoles={availableRolesToAdd}
      />
    </SafeAreaView>
  );
};

// Demo User Data
const demoUser: UserProfile = {
  id: '1',
  name: 'Jean-Pierre Dubois',
  email: 'jean-pierre.dubois@example.com',
  phone: '+33 1 23 45 67 89',
  location: 'Paris, France',
  profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  joinDate: '2023-01-15',
  lastActiveDate: '2024-01-18',
  roles: [
    {
      type: 'buyer',
      isActive: true,
      level: 'intermediate',
      joinDate: '2023-01-15',
      specificData: {
        budget: { min: 300000, max: 500000 },
        preferredLocations: ['Paris', 'Lyon'],
        propertyTypes: ['apartment', 'house'],
        savedSearches: [
          {
            id: '1',
            name: 'Appartement Paris 16e',
            location: 'Paris 16e',
            budget: { min: 400000, max: 600000 },
            propertyType: 'apartment',
            rooms: 3,
            createdAt: '2024-01-10'
          }
        ]
      }
    },
    {
      type: 'seller',
      isActive: false,
      level: 'beginner',
      joinDate: '2023-06-01',
      specificData: {
        listedProperties: [
          {
            id: '1',
            address: '123 Rue de la Paix, Paris',
            price: 450000,
            status: 'active',
            type: 'apartment',
            rooms: 2,
            area: 65,
            listedDate: '2024-01-01'
          }
        ],
        successfulSalesCount: 0
      }
    }
  ],
  verification: {
    identity: true,
    email: true,
    phone: true,
    address: false,
    income: false,
    proofOfAddress: false,
    creditScore: 720
  },
  statistics: {
    totalViews: 45,
    totalTransactions: 2,
    averageRating: 4.3,
    completedDeals: 1
  },
  recentActivity: [
    {
      type: 'view',
      description: 'Visite d\'un appartement Rue de Rivoli',
      date: '2024-01-18T10:30:00Z',
      details: {}
    },
    {
      type: 'contact',
      description: 'Contact avec un agent immobilier',
      date: '2024-01-17T14:15:00Z',
      details: {}
    },
    {
      type: 'offer',
      description: 'Offre soumise pour un appartement',
      date: '2024-01-16T09:00:00Z',
      details: {}
    }
  ],
  documents: [
    {
      id: '1',
      name: 'Carte d\'identité',
      type: 'identity',
      url: 'https://example.com/doc1.pdf',
      uploadDate: '2023-01-20T00:00:00Z',
      status: 'approved'
    },
    {
      id: '2',
      name: 'Justificatif de revenus',
      type: 'incomeStatement',
      url: 'https://example.com/doc2.pdf',
      uploadDate: '2023-02-01T00:00:00Z',
      status: 'pending'
    }
  ],
  notificationPreferences: {
    email: true,
    sms: false,
    push: true,
    marketing: false
  },
  privacySettings: {
    profileVisibility: 'public',
    contactInfoVisibility: 'verified',
    showOnlineStatus: true
  }
};

export default ProfileScreen;
        