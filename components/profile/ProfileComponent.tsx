
import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, User, Settings, Eye, Heart, Key, TrendingUp, DollarSign, MapPin, 
  Calendar, Phone, Mail, Star, Badge, Users, Building, Search, Filter,
   Bell, MessageCircle, FileText, Camera, Edit3, Plus, Trash2, CheckCircle, 
   XCircle, Clock, BarChart3, Target, Briefcase, Shield, Award, Zap, Sparkles,
    ChevronRight, ChevronLeft, Map, MessageSquareText,Tool
} from 'lucide-react-native';
import { TextInput, TouchableOpacity, Modal, Image, Linking, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook'; // Assuming your theme hook works with NativeWind

// Import your UPDATED types
import {
  UserProfile, UserRole, BuyerData, SellerData, RenterData, OwnerData, AgentData, DeveloperData, Property, UserStatistics, Activity, NotificationPreferences, PrivacySettings, PropertyViewing, Offer, RentalHistory, Tenant, MaintenanceRequest, Document, Message, Appointment, SavedSearch, Mandate, DevelopmentProject, demoUser
} from '@/types/profileType'; // Ensure this path is correct

// --- Sub-Components (New or Enhanced) ---

// Component for displaying verification badges and trust level
const UserBadges: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { theme } = useTheme();

  const VerificationBadge = () => {
    const verifiedCount = Object.values(user.verification).filter(value => value === true).length;
    // Exclude creditScore from total verification types if it's optional and not always present
    const totalCount = Object.keys(user.verification).filter(key => key !== 'creditScore').length;
    const percentage = (totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0);

    return (
      <ThemedView className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-surface">
        <Shield size={14} className="text-success" />
        <ThemedText className="text-xs font-medium text-success">
          {percentage.toFixed(0)}% Vérifié
        </ThemedText>
      </ThemedView>
    );
  };

  const TrustLevel = () => {
    // Assuming averageRating from 0-5
    const trustScore = Math.round((user.statistics.averageRating / 5) * 100);

    return (
      <ThemedView className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-surface">
        <Award size={14} className="text-secondary" />
        <ThemedText className="text-xs font-medium text-secondary">
          {trustScore}% Confiance
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView className="flex-row flex-wrap gap-2 mb-4">
      <VerificationBadge />
      <TrustLevel />
    </ThemedView>
  );
};

// Component for managing user roles
const RoleManagement: React.FC<{
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActivePersona: React.Dispatch<React.SetStateAction<UserRole['type']>>;
  setSelectedRoleForDetails: React.Dispatch<React.SetStateAction<UserRole | null>>;
  activePersona: UserRole['type'];
}> = ({ user, setUser, setActivePersona, setSelectedRoleForDetails, activePersona }) => {
  const [newRoleType, setNewRoleType] = useState('');
  const { theme } = useTheme();

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

  const getRoleText = (roleType: string) => {
    const texts: any = {
      buyer: 'Acheteur',
      seller: 'Vendeur',
      renter: 'Locataire',
      owner: 'Propriétaire',
      agent: 'Agent',
      developer: 'Promoteur'
    };
    return texts[roleType] || roleType.charAt(0).toUpperCase() + roleType.slice(1);
  };

  const getLevelBadgeClasses = (level: string) => {
    const classes: any = {
      beginner: 'bg-gray-200 text-gray-700',
      intermediate: 'bg-blue-100 text-blue-700',
      expert: 'bg-purple-100 text-purple-700',
      professional: 'bg-green-100 text-green-700'
    };
    return classes[level] || classes.beginner;
  };

  const getRoleIconColorClass = (roleType: string) => {
    const colorClasses: any = {
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
    const bgClasses: any = {
      buyer: 'bg-blue-50',
      seller: 'bg-purple-100',
      renter: 'bg-blue-100',
      owner: 'bg-blue-50',
      agent: 'bg-purple-100',
      developer: 'bg-blue-100'
    };
    return bgClasses[roleType] || 'bg-gray-100';
  };

  const addRole = (roleType: string) => {
    if (roleType && !user.roles.some(role => role.type === roleType)) {
      const newRole: UserRole = {
        type: roleType as any,
        isActive: true,
        level: 'beginner',
        joinDate: new Date().toISOString().split('T')[0],
        specificData: {} // Initialize with empty object, will need more specific defaults in a real app
      };

      setUser(prev => ({
        ...prev,
        roles: [...prev.roles, newRole]
      }));
      setActivePersona(roleType as UserRole['type']);
    }
    setNewRoleType('');
  };

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

  return (
    <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-4">
        Gérer Mes Rôles
      </ThemedText>

      <ThemedView className="flex-row items-center gap-3 mb-5">
        <ThemedView className="flex-1 h-12 border border-outline rounded-lg bg-surface justify-center">
          <Picker
            selectedValue={newRoleType}
            onValueChange={(itemValue) => setNewRoleType(itemValue)}
            style={{ color: theme.input.text }}
          >
            <Picker.Item label="Ajouter un rôle" value="" />
            {['buyer', 'seller', 'renter', 'owner', 'agent', 'developer']
              .filter(type => !user.roles.some(role => role.type === type))
              .map(type => (
                <Picker.Item key={type} label={getRoleText(type)} value={type} />
              ))}
          </Picker>
        </ThemedView>

        {newRoleType && (
          <TouchableOpacity
            onPress={() => addRole(newRoleType)}
            className="flex-row items-center gap-1.5 px-4 py-3 bg-primary rounded-lg"
          >
            <Plus size={16} className="text-on-primary" />
            <ThemedText className="text-on-primary font-medium">
              Ajouter
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView className="flex-row flex-wrap gap-3">
        {user.roles.map((role) => {
          const Icon = getRoleIcon(role.type);
          const levelBadgeClasses = getLevelBadgeClasses(role.level);
          const iconColorClass = getRoleIconColorClass(role.type);
          const iconBgClass = getRoleIconBgClass(role.type);

          return (
            <TouchableOpacity
              key={role.type}
              onPress={() => setSelectedRoleForDetails(role)}
              className={`bg-surface-variant rounded-xl p-4 flex-1 min-w-[45%] max-w-[48%] relative border-2 ${role.type === activePersona ? 'border-primary' : 'border-transparent'}`}
            >
              <ThemedView className="flex-row items-center justify-between mb-3">
                <ThemedView className={`w-12 h-12 rounded-lg items-center justify-center ${iconBgClass}`}>
                  <Icon size={24} className={iconColorClass} />
                </ThemedView>

                <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold ${levelBadgeClasses}`}>
                  {role.level === 'professional' ? 'Professionnel' : role.level === 'expert' ? 'Expert' : role.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                </ThemedText>
              </ThemedView>

              <ThemedText className="text-base font-semibold text-on-surface mb-1">
                {getRoleText(role.type)}
              </ThemedText>

              <ThemedText className="text-xs text-on-surface-variant mb-3">
                Actif depuis {new Date(role.joinDate).toLocaleDateString('fr-FR')}
              </ThemedText>

              {/* Displaying specific data based on role type */}
              {role.type === 'buyer' && (
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedText className="text-xs text-on-surface-variant">
                    Budget:
                  </ThemedText>
                  <ThemedText className="text-xs font-medium text-on-surface">
                    {(role.specificData as BuyerData).budget?.min?.toLocaleString('fr-FR')} - {(role.specificData as BuyerData).budget?.max?.toLocaleString('fr-FR')}€
                  </ThemedText>
                </ThemedView>
              )}
              {role.type === 'seller' && (
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedText className="text-xs text-on-surface-variant">
                    Ventes réussies:
                  </ThemedText>
                  <ThemedText className="text-xs font-medium text-on-surface">
                    {(role.specificData as SellerData).successfulSalesCount || 0}
                  </ThemedText>
                </ThemedView>
              )}
              {role.type === 'owner' && (
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedText className="text-xs text-on-surface-variant">
                    Propriétés:
                  </ThemedText>
                  <ThemedText className="text-xs font-medium text-on-surface">
                    {(role.specificData as OwnerData).ownedProperties?.length || 0}
                  </ThemedText>
                </ThemedView>
              )}
              {role.type === 'agent' && (
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedText className="text-xs text-on-surface-variant">
                    Mandats actifs:
                  </ThemedText>
                  <ThemedText className="text-xs font-medium text-on-surface">
                    {(role.specificData as AgentData).mandates?.filter(m => m.status === 'active').length || 0}
                  </ThemedText>
                </ThemedView>
              )}

              {/* Active/Inactive toggle dot */}
              <TouchableOpacity
                onPress={() => toggleRole(role.type)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: role.isActive ? theme.success : theme.outline }}
              >
                <ThemedView className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.success }} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
};

// Component for displaying verification status
const VerificationSection: React.FC<{ user: UserProfile; isEditMode: boolean }> = ({ user, isEditMode }) => {
  const { theme } = useTheme();
  return (
    <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-4">
        Statut de Vérification
      </ThemedText>

      <ThemedView className="gap-2">
        {Object.entries(user.verification).map(([key, value]) => (
          <ThemedView key={key} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg">
            <ThemedView className="flex-row items-center gap-3">
              {value ? (
                <CheckCircle size={20} className="text-success" />
              ) : (
                <XCircle size={20} className="text-error" />
              )}
              <ThemedText className="text-base font-medium text-on-surface capitalize">
                {/* Format key for better display */}
                {key.replace(/([A-Z])/g, ' $1').replace('credit Score', 'Score de Crédit').replace('proof Of Address', 'Justificatif de Domicile').replace('identity', 'Identité').replace('email', 'Email').replace('phone', 'Téléphone').replace('address', 'Adresse').replace('income', 'Revenus')}
              </ThemedText>
            </ThemedView>

            <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${value ? 'bg-success' : 'bg-error'}`}>
              {value ? 'Vérifié' : 'Non vérifié'}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {!user.verification.identity && isEditMode && (
        <TouchableOpacity className="mt-4 flex-row items-center gap-2 px-4 py-3 bg-primary rounded-lg self-start">
          <Camera size={16} className="text-on-primary" />
          <ThemedText className="text-on-primary font-medium">
            Vérifier l'identité
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

// Component for displaying user documents
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
    <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-4">
        Mes Documents
      </ThemedText>

      {user.documents.length === 0 ? (
        <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
          <FileText size={48} color = {theme.surfaceVariant} />
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
        <ThemedView>
          {user.documents.map(doc => (
            <ThemedView key={doc.id} className="flex-row items-center justify-between py-4 border-b border-outline last:border-b-0">
              <ThemedView className="flex-row items-center gap-3 flex-1">
                <FileText size={24} className="text-on-surface" />
                <ThemedView className="flex-1">
                  <ThemedText className="text-base font-medium text-on-surface">
                    {doc.name}
                  </ThemedText>
                  <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                    {getDocumentTypeText(doc.type)} - {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView className="flex-row items-center gap-3">
                <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${doc.status === 'approved' ? 'bg-success' : doc.status === 'pending' ? 'bg-secondary' : 'bg-error'}`}>
                  {doc.status === 'approved' ? 'Approuvé' : doc.status === 'pending' ? 'En attente' : 'Rejeté'}
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

// Component for displaying role-specific content/dashboard
const RoleSpecificContent: React.FC<{ user: UserProfile; activePersona: UserRole['type'] }> = ({ user, activePersona }) => {
  const { theme } = useTheme();

  const currentRoleData = user.roles.find(role => role.type === activePersona);

  if (!currentRoleData) {
    return (
      <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
        <ThemedText className="text-on-surface-variant text-center mb-4">
          Veuillez sélectionner un rôle actif pour voir les détails.
        </ThemedText>
      </ThemedView>
    );
  }

  // --- Dynamic Content based on Active Persona ---
  switch (activePersona) {
    case 'buyer':
      const buyerData = currentRoleData.specificData as BuyerData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Recherches Actives & Visites
          </ThemedText>
          {buyerData.savedSearches && buyerData.savedSearches.length > 0 ? (
            buyerData.savedSearches.map((search, index) => (
              <ThemedView key={search.id || index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3 flex-1">
                  <Search size={20} className="text-primary" />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {search.name || search.location || 'Recherche sauvegardée'}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      {search.budget ? `Budget: ${search.budget.min.toLocaleString('fr-FR')} - ${search.budget.max.toLocaleString('fr-FR')}€` : 'Budget non spécifié'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color = {theme.surfaceVariant} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Search size={48} color = {theme.surfaceVariant} />
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

          {buyerData.propertyViewings && buyerData.propertyViewings.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Visites Préparées
              </ThemedText>
              {buyerData.propertyViewings.map((viewing, index) => (
                <ThemedView key={viewing.propertyId + index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <Eye size={20} className="text-info" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {viewing.propertyName}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        {new Date(viewing.date).toLocaleDateString('fr-FR')} à {viewing.time}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${viewing.status === 'confirmed' || viewing.status === 'completed' ? 'bg-success' : 'bg-secondary'}`}>
                    {viewing.status === 'scheduled' ? 'Prévue' : viewing.status === 'confirmed' ? 'Confirmée' : viewing.status === 'completed' ? 'Terminée' : 'Annulée'}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {buyerData.offersMade && buyerData.offersMade.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Offres Soumises
              </ThemedText>
              {buyerData.offersMade.map((offer, index) => (
                <ThemedView key={offer.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <DollarSign size={20} className="text-success" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {offer.propertyAddress} - {offer.amount.toLocaleString('fr-FR')}€
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        Soumise le {new Date(offer.date).toLocaleDateString('fr-FR')}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${offer.status === 'accepted' ? 'bg-success' : offer.status === 'pending' ? 'bg-warning' : 'bg-error'}`}>
                    {offer.status === 'pending' ? 'En attente' : offer.status === 'accepted' ? 'Acceptée' : offer.status === 'rejected' ? 'Rejetée' : 'Négociation'}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </>
      );
    case 'seller':
      const sellerData = currentRoleData.specificData as SellerData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Propriétés à Vendre & Offres
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
                <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${property.status === 'active' ? 'bg-success' : property.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                  {property.status === 'active' ? 'Actif' : property.status === 'sold' ? 'Vendue' : 'En attente'}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <DollarSign size={48} color = {theme.surfaceVariant} />
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

          {sellerData.offersReceived && sellerData.offersReceived.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Offres Reçues
              </ThemedText>
              {sellerData.offersReceived.map((offer, index) => (
                <ThemedView key={offer.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <DollarSign size={20} className="text-success" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {offer.propertyAddress} - {offer.amount.toLocaleString('fr-FR')}€
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        De {offer.buyerName} ({new Date(offer.date).toLocaleDateString('fr-FR')})
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${offer.status === 'accepted' ? 'bg-success' : offer.status === 'pending' ? 'bg-warning' : 'bg-error'}`}>
                    {offer.status === 'pending' ? 'En attente' : offer.status === 'accepted' ? 'Acceptée' : offer.status === 'rejected' ? 'Rejetée' : 'Négociation'}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </>
      );
    case 'renter':
      const renterData = currentRoleData.specificData as RenterData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Locations & Demandes
          </ThemedText>
          {renterData.rentalHistory && renterData.rentalHistory.length > 0 ? (
            renterData.rentalHistory.map((rental, index) => (
              <ThemedView key={rental.propertyId + index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3">
                  <Key size={20} className="text-info" />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {rental.propertyName}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(rental.startDate).toLocaleDateString('fr-FR')} - {rental.endDate ? new Date(rental.endDate).toLocaleDateString('fr-FR') : 'Actuel'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color = {theme.surfaceVariant} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Key size={48} color = {theme.surfaceVariant} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Aucun historique de location trouvé.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Search size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Trouver une location
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {renterData.maintenanceRequests && renterData.maintenanceRequests.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Demandes de Maintenance
              </ThemedText>
              {renterData.maintenanceRequests.map((request, index) => (
                <ThemedView key={request.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <Tool size={20} color = {theme.warning} />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {request.issue}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        Statut: {request.status === 'pending' ? 'En attente' : request.status === 'in-progress' ? 'En cours' : request.status === 'completed' ? 'Terminée' : 'Annulée'} ({new Date(request.dateRequested).toLocaleDateString('fr-FR')})
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ChevronRight size={20} color = {theme.surfaceVariant} />
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {renterData.savedRentalSearches && renterData.savedRentalSearches.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Recherches de Location Sauvegardées
              </ThemedText>
              {renterData.savedRentalSearches.map((search, index) => (
                <ThemedView key={search.id || index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3 flex-1">
                    <Search size={20} className="text-primary" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {search.name || search.location || 'Recherche de location'}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        {search.budget ? `Budget: ${search.budget.min.toLocaleString('fr-FR')} - ${search.budget.max.toLocaleString('fr-FR')}€` : 'Budget non spécifié'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ChevronRight size={20} color = {theme.surfaceVariant} />
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </>
      );
    case 'owner':
      const ownerData = currentRoleData.specificData as OwnerData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Propriétés & Locataires
          </ThemedText>
          {ownerData.ownedProperties && ownerData.ownedProperties.length > 0 ? (
            ownerData.ownedProperties.map(property => (
              <ThemedView key={property.id} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3">
                  <Building size={20} color = {theme.primary} />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {property.address}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      Type: {property.type}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color = {theme.surfaceVariant} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Building size={48} color = {theme.surfaceVariant} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Vous n'avez pas enregistré de propriétés en propriété.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Plus size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Ajouter une propriété
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {ownerData.tenants && ownerData.tenants.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Locataires Actuels
              </ThemedText>
              {ownerData.tenants.map((tenant, index) => (
                <ThemedView key={tenant.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <User size={20} className="text-green-600" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {tenant.firstName} {tenant.lastName}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        Propriété: {tenant.propertyName || 'N/A'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ChevronRight size={20} color = {theme.surfaceVariant} />
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {ownerData.maintenanceRequests && ownerData.maintenanceRequests.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Demandes de Maintenance pour Mes Propriétés
              </ThemedText>
              {ownerData.maintenanceRequests.map((request, index) => (
                <ThemedView key={request.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <Tool size={20} color = {theme.error}/>
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {request.issue} ({request.propertyName || 'N/A'})
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        Statut: {request.status === 'pending' ? 'En attente' : request.status === 'in-progress' ? 'En cours' : request.status === 'completed' ? 'Terminée' : 'Annulée'} ({new Date(request.dateRequested).toLocaleDateString('fr-FR')})
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ChevronRight size={20} color = {theme.surfaceVariant} />
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {ownerData.publishedRentalListings && ownerData.publishedRentalListings.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Annonces de Location Publiées
              </ThemedText>
              {ownerData.publishedRentalListings.map(listing => (
                <ThemedView key={listing.id} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <Home size={20} className="text-info" />
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {listing.address}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        Loyer: {listing.price.toLocaleString('fr-FR')}€/mois
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${listing.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {listing.status === 'active' ? 'Active' : 'Louée'}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </>
      );
    case 'agent':
      const agentData = currentRoleData.specificData as AgentData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Mandats & Transactions
          </ThemedText>
          {agentData.mandates && agentData.mandates.length > 0 ? (
            agentData.mandates.map((mandate, index) => (
              <ThemedView key={mandate.id || index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3">
                  <Users size={20} className="text-purple-600" />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {mandate.propertyAddress}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      Type: {mandate.type === 'sale' ? 'Vente' : 'Location'} - Statut: {mandate.status === 'active' ? 'Actif' : 'Exp. / Cmp.'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color = {theme.surfaceVariant} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Users size={48} color = {theme.surfaceVariant} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Vous n'avez pas de mandats actifs.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Plus size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Ajouter un mandat
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {agentData.appointments && agentData.appointments.length > 0 && (
            <ThemedView className="mt-6">
              <ThemedText className="text-lg font-semibold text-on-surface mb-3">
                Mes Rendez-vous d'Agent
              </ThemedText>
              {agentData.appointments.map((appt, index) => (
                <ThemedView key={appt.id || index} className="flex-row items-center justify-between py-3 px-4 bg-surface-variant rounded-lg mb-2">
                  <ThemedView className="flex-row items-center gap-3">
                    <Calendar size={20} color = {theme.error}/>
                    <ThemedView>
                      <ThemedText className="text-base font-medium text-on-surface">
                        {appt.propertyAddress || appt.withUser}
                      </ThemedText>
                      <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                        {new Date(appt.date).toLocaleDateString('fr-FR')} à {appt.time} - {appt.type === 'viewing' ? 'Visite' : appt.type === 'meeting' ? 'Rendez-vous' : appt.type === 'call' ? 'Appel' : 'Signature'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText className={`px-2 py-1 rounded-md text-xs font-semibold text-surface ${appt.status === 'scheduled' ? 'bg-secondary' : appt.status === 'completed' ? 'bg-success' : 'bg-error'}`}>
                    {appt.status === 'scheduled' ? 'Prévu' : appt.status === 'completed' ? 'Terminé' : 'Annulé'}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </>
      );
    case 'developer':
      const developerData = currentRoleData.specificData as DeveloperData;
      return (
        <>
          <ThemedText className="text-lg font-semibold text-on-surface mb-4">
            Mes Projets de Développement
          </ThemedText>
          {developerData.projects && developerData.projects.length > 0 ? (
            developerData.projects.map((project, index) => (
              <ThemedView key={project.id || index} className="flex-row items-center justify-between py-4 px-4 bg-surface-variant rounded-lg mb-2">
                <ThemedView className="flex-row items-center gap-3">
                  <Briefcase size={20} className="text-blue-600" />
                  <ThemedView>
                    <ThemedText className="text-base font-medium text-on-surface">
                      {project.name}
                    </ThemedText>
                    <ThemedText className="text-xs text-on-surface-variant mt-0.5">
                      Localisation: {project.location} - Unités disp.: {project.unitsAvailable}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ChevronRight size={20} color = {theme.surfaceVariant} />
              </ThemedView>
            ))
          ) : (
            <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
              <Briefcase size={48} color = {theme.surfaceVariant} />
              <ThemedText className="text-on-surface-variant text-center mb-4 mt-2">
                Vous n'avez pas de projets de développement.
              </ThemedText>
              <TouchableOpacity className="flex-row items-center gap-1 px-4 py-3 bg-primary rounded-lg">
                <Plus size={16} className="text-on-primary" />
                <ThemedText className="text-on-primary font-medium">
                  Ajouter un projet
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </>
      );
    default:
      return (
        <ThemedView className="py-10 px-5 bg-surface-variant rounded-xl items-center">
          <ThemedText className="text-on-surface-variant text-center">
            Sélectionnez un rôle pour voir les informations spécifiques.
          </ThemedText>
        </ThemedView>
      );
  }
};

// Component for the Transaction Process/Timeline (Conceptual)
const TransactionTimeline: React.FC<{ userActivities: Activity[] }> = ({ userActivities }) => {
  const processSteps = [
    { id: 1, name: "Prise de Contact", statusKey: "contact", icon: Mail },
    { id: 2, name: "Discussion & Offre", statusKey: "offer", icon: MessageSquareText },
    { id: 3, name: "Planification Visite", statusKey: "viewing", icon: Calendar },
    { id: 4, name: "Engagement & Docs", statusKey: "document_submission", icon: FileText },
    { id: 5, name: "Validation & Contrat", statusKey: "contract_signing", icon: CheckCircle },
    { id: 6, name: "Acquisition/Installation", statusKey: "completion", icon: Key },
  ];
  const { theme } = useTheme();

  // Determine the overall progress based on recent activities
  const getStepStatus = (statusKey: string) => {
    const relevantActivities = userActivities.filter(act => {
      // Map activity types to timeline status keys
      if (statusKey === 'contact' && act.type === 'message') return true;
      if (statusKey === 'offer' && act.type === 'offer') return true;
      if (statusKey === 'viewing' && act.type === 'viewing') return true;
      // Add more mappings for document_submission, contract_signing, completion if available in activities
      return false;
    });

    if (relevantActivities.some(act => act.status === 'completed' || act.status === 'accepted' || act.status === 'signed')) {
      return 'completed';
    }
    if (relevantActivities.some(act => act.status === 'active' || act.status === 'pending' || act.status === 'scheduled' || act.status === 'in-progress')) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
      <ThemedText className="text-lg font-semibold text-on-surface mb-4">
        Suivi des Processus
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(step.statusKey);
          const isCompleted = status === 'completed';
          const isActive = status === 'active';
          const isPending = status === 'pending';

          return (
            <ThemedView key={step.id} className="flex-col items-center mx-3">
              <ThemedView className={`w-14 h-14 rounded-full items-center justify-center border-2 ${isCompleted ? 'bg-success border-success' : isActive ? 'bg-primary border-primary' : 'bg-surface-variant border-outline'}`}>
                <Icon size={24} className={`${isCompleted ? 'text-on-success' : isActive ? 'text-on-primary' : 'text-on-surface-variant'}`} />
              </ThemedView>
              <ThemedText className={`text-center text-xs mt-2 ${isCompleted ? 'text-success' : isActive ? 'text-primary font-medium' : 'text-on-surface-variant'}`} style={{ width: 80 }}>
                {step.name}
              </ThemedText>
              {index < processSteps.length - 1 && (
                <ThemedView className={`absolute top-7 left-[70px] w-20 h-0.5 ${isCompleted && getStepStatus(processSteps[index + 1].statusKey) !== 'active' ? 'bg-success' : isActive ? 'bg-outline' : 'bg-outline'}`} />
              )}
            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
};


// Main Profile Component
const ProfileFile = () => {
  const [user, setUser] = useState<UserProfile>(demoUser);
  const [activePersona, setActivePersona] = useState<UserRole['type']>(user.roles[0]?.type || 'buyer');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoleForDetails, setSelectedRoleForDetails] = useState<UserRole | null>(null);

  const { theme } = useTheme();

  const activeRoles = useMemo(() => user.roles.filter(role => role.isActive), [user.roles]);

  useEffect(() => {
    // If the currently active persona becomes inactive or is removed, default to the first active role
    if (!activeRoles.some(role => role.type === activePersona) && activeRoles.length > 0) {
      setActivePersona(activeRoles[0].type);
    } else if (activeRoles.length === 0) {
      // If no active roles, might want to show a message or default to a "setup" view
      setActivePersona('buyer'); // Default to buyer if no roles are active for now
    }
  }, [activeRoles, activePersona]);

  const getRoleText = (roleType: string) => {
    const texts: any = {
      buyer: 'Acheteur',
      seller: 'Vendeur',
      renter: 'Locataire',
      owner: 'Propriétaire',
      agent: 'Agent',
      developer: 'Promoteur'
    };
    return texts[roleType] || roleType.charAt(0).toUpperCase() + roleType.slice(1);
  };

  return (
    <SafeAreaView>
      <ScrollView
        // className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile & Persona Switcher */}
        <ThemedView  backgroundColor='success' className=" pt-5 pb-6 px-4 shadow-sm rounded-b-2xl">
          <ThemedView className="flex-row items-center gap-4 mb-4">
            <ThemedView className="relative">
              <Image
                source={{ uri: user.personalInfo.avatar }}
                className="w-20 h-20 rounded-full border-3 border-surface"
              />
              <ThemedView className="absolute bottom-[-2px] right-[-2px] w-6 h-6 rounded-full bg-success border-2 border-surface items-center justify-center">
                <CheckCircle size={12} color = {theme.success} />
              </ThemedView>
            </ThemedView>

            <ThemedView className="flex-1">
              <ThemedText className="text-xl font-bold text-on-primary mb-1">
                {user.personalInfo.firstName} {user.personalInfo.lastName}
              </ThemedText>
              <ThemedText className="text-sm text-on-primary opacity-80 mb-3">
                {user.personalInfo.email}
              </ThemedText>
              <ThemedText className="text-sm text-on-primary opacity-80">
                {/* {user.contactInfo.phone} */}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <UserBadges user={user} />

          <TouchableOpacity
            onPress={() => setIsEditMode(!isEditMode)}
            className="self-start px-4 py-2 bg-accent rounded-lg flex-row items-center gap-1.5"
          >
            <Edit3 size={16} className="text-on-accent" />
            <ThemedText className="text-on-accent font-medium text-sm">
              {isEditMode ? 'Sauvegarder' : 'Modifier'}
            </ThemedText>
          </TouchableOpacity>

          {/* Persona Switcher */}
          {activeRoles.length > 1 && (
            <ThemedView className="flex-row justify-around mt-4 px-4 py-2 rounded-xl bg-surface-variant">
              {activeRoles.map((role) => (
                <TouchableOpacity
                  key={role.type}
                  onPress={() => setActivePersona(role.type)}
                  className={`flex-1 py-2 px-3 rounded-lg items-center ${activePersona === role.type ? 'bg-primary' : ''}`}
                >
                  <ThemedText
                    className={`text-sm font-semibold ${activePersona === role.type ? 'text-on-primary' : 'text-on-surface-variant'}`}
                  >
                    {getRoleText(role.type)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Main Content Area */}
        <ThemedView className="flex-1 px-4 pt-6">

          {/* Dynamic Content based on Active Persona */}
          <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm">
            <RoleSpecificContent user={user} activePersona={activePersona} />
          </ThemedView>

          {/* Transaction Process Timeline */}
          {/* Pass user.activities to the timeline for dynamic status */}
          <TransactionTimeline userActivities={user.activities} />

          {/* Manage Roles Section */}
          <RoleManagement
            user={user}
            setUser={setUser}
            setActivePersona={setActivePersona}
            setSelectedRoleForDetails={setSelectedRoleForDetails}
            activePersona={activePersona}
          />

          {/* Verification Section */}
          <VerificationSection user={user} isEditMode={isEditMode} />

          {/* Documents Section */}
          <DocumentsSection user={user} isEditMode={isEditMode} />

          {/* Placeholder for Messaging, Favorites, Reviews (Future Enhancements) */}
          <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm items-center justify-center min-h-[100px]">
            <MessageSquareText size={32} className="text-info mb-2" />
            <ThemedText className="text-on-surface-variant font-medium text-base">
              Messagerie & Avis (À venir !)
            </ThemedText>
          </ThemedView>
          <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm items-center justify-center min-h-[100px]">
            <Heart size={32} className="text-red-500 mb-2" />
            <ThemedText className="text-on-surface-variant font-medium text-base">
              Favoris & Alertes (À venir !)
            </ThemedText>
          </ThemedView>
          <ThemedView className="bg-surface rounded-2xl p-5 mb-5 shadow-sm items-center justify-center min-h-[100px]">
            <Map size={32} className="text-green-600 mb-2" />
            <ThemedText className="text-on-surface-variant font-medium text-base">
              Cartographie & Vues RA (À venir !)
            </ThemedText>
          </ThemedView>

        </ThemedView>
      </ScrollView>

      {/* Modal for Role Details */}
      {selectedRoleForDetails && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedRoleForDetails}
          onRequestClose={() => setSelectedRoleForDetails(null)}
        >
          <ThemedView className="flex-1 justify-center items-center bg-black/50">
            <ThemedView className="bg-surface rounded-2xl p-6 w-[90%] max-w-[400px]">
              <ThemedText className="text-xl font-bold text-on-surface mb-4">
                Détails du rôle {getRoleText(selectedRoleForDetails.type)}
              </ThemedText>

              <ThemedText className="text-sm text-on-surface mb-2">
                Niveau: {selectedRoleForDetails.level === 'professional' ? 'Professionnel' : selectedRoleForDetails.level === 'expert' ? 'Expert' : selectedRoleForDetails.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
              </ThemedText>

              <ThemedText className="text-sm text-on-surface mb-2">
                Statut: {selectedRoleForDetails.isActive ? 'Actif' : 'Inactif'}
              </ThemedText>

              {/* Displaying more specific data based on role type in modal */}
              {selectedRoleForDetails.type === 'buyer' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Budget: {(selectedRoleForDetails.specificData as BuyerData).budget?.min?.toLocaleString('fr-FR')} - {(selectedRoleForDetails.specificData as BuyerData).budget?.max?.toLocaleString('fr-FR')}€
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Recherches sauvegardées: {(selectedRoleForDetails.specificData as BuyerData).savedSearches?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Visites planifiées: {(selectedRoleForDetails.specificData as BuyerData).propertyViewings?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Offres soumises: {(selectedRoleForDetails.specificData as BuyerData).offersMade?.length || 0}
                  </ThemedText>
                </>
              )}
              {selectedRoleForDetails.type === 'seller' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Propriétés listées: {(selectedRoleForDetails.specificData as SellerData).listedProperties?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Ventes réussies: {(selectedRoleForDetails.specificData as SellerData).successfulSalesCount || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Offres reçues: {(selectedRoleForDetails.specificData as SellerData).offersReceived?.length || 0}
                  </ThemedText>
                </>
              )}
              {selectedRoleForDetails.type === 'renter' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Loyer max. mensuel: {(selectedRoleForDetails.specificData as RenterData).rentalBudget?.monthlyMax?.toLocaleString('fr-FR')}€
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Historique de locations: {(selectedRoleForDetails.specificData as RenterData).rentalHistory?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Demandes de maintenance: {(selectedRoleForDetails.specificData as RenterData).maintenanceRequests?.length || 0}
                  </ThemedText>
                </>
              )}
              {selectedRoleForDetails.type === 'owner' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Propriétés possédées: {(selectedRoleForDetails.specificData as OwnerData).ownedProperties?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Locataires actuels: {(selectedRoleForDetails.specificData as OwnerData).tenants?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Annonces de location publiées: {(selectedRoleForDetails.specificData as OwnerData).publishedRentalListings?.length || 0}
                  </ThemedText>
                </>
              )}
              {selectedRoleForDetails.type === 'agent' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Nom de l'agence: {(selectedRoleForDetails.specificData as AgentData).agencyName}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Mandats actifs: {(selectedRoleForDetails.specificData as AgentData).mandates?.filter(m => m.status === 'active').length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Transactions réussies: {(selectedRoleForDetails.specificData as AgentData).successfulTransactionsCount || 0}
                  </ThemedText>
                </>
              )}
              {selectedRoleForDetails.type === 'developer' && (
                <>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Nom de l'entreprise: {(selectedRoleForDetails.specificData as DeveloperData).companyName}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Projets en cours: {(selectedRoleForDetails.specificData as DeveloperData).projects?.length || 0}
                  </ThemedText>
                  <ThemedText className="text-sm text-on-surface mb-1">
                    Unités vendues: {(selectedRoleForDetails.specificData as DeveloperData).unitsSold || 0}
                  </ThemedText>
                </>
              )}


              <TouchableOpacity
                onPress={() => setSelectedRoleForDetails(null)}
                className="mt-5 bg-primary py-3 px-6 rounded-lg items-center"
              >
                <ThemedText className="text-on-primary font-medium">
                  Fermer
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default ProfileFile;
