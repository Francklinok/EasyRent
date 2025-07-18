import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, Modal, Switch } from 'react-native';
import { 
  User, Mail, Phone, Lock, Shield, Trash2, LogOut, 
  ChevronRight, Camera, Zap, X, ChevronDown, Bell, 
  Eye, EyeOff, HelpCircle, FileText, MessageCircle,
  Settings, Globe, Database, Download, Share2
} from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';
// Composant principal du panneau de compte
const AccountPanel = ({ onClose }) => {
  const [user, setUser] = useState({
    username: 'Utilisateur123',
    email: 'utilisateur@exemple.com',
    phone: '+33 6 12 34 56 78',
    status: 'En ligne',
    bio: 'Passionné de tech et de jeux vidéo',
    createdAt: 'Mai 2022'
  });
  
  const  {theme} = useTheme()
  // États pour les paramètres de notification
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    messageNotifications: true,
    friendRequestNotifications: true,
    systemNotifications: true
  });
  
  // États pour les paramètres de confidentialité
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public', // public, friends, private
    showOnlineStatus: true,
    showLastSeen: true,
    allowDirectMessages: true,
    allowFriendRequests: true,
    dataCollection: true,
    analyticsEnabled: true
  });
  
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [statusOptions] = useState(['En ligne', 'Ne pas déranger', 'Inactif', 'Invisible']);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('profile'); // profile, notifications, privacy, help, security
  
  const handleEdit = (field, value) => {
    setEditing(field);
    setEditValue(value);
  };
  
  const saveEdit = () => {
    if (editing) {
      setUser(prev => ({ ...prev, [editing]: editValue }));
      setEditing(null);
    }
  };
  
  const cancelEdit = () => {
    setEditing(null);
  };
  
  const setStatus = (status) => {
    setUser(prev => ({ ...prev, status }));
    setShowStatusMenu(false);
  };
  
  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const togglePrivacy = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const setPrivacyOption = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'En ligne': return 'bg-green-500';
      case 'Ne pas déranger': return 'bg-red-500';
      case 'Inactif': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Composant pour les sections de profil
  const ProfileSection = ({ field, title, value, icon, editable = true }) => (
    <ThemedView className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
      {editing === field ? (
        <ThemedView className="flex flex-col">
          <ThemedText className="text-sm mb-1">{title}</ThemedText>
          <TextInput 
            value={editValue} 
            onChangeText={setEditValue}
            className={`mb-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          />
          <ThemedView className="flex flex-row justify-end space-x-2">
            <TouchableOpacity 
              onPress={cancelEdit}
              className={`px-2 py-1 rounded mr-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <ThemedText className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Annuler</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={saveEdit}
              className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}
            >
              <ThemedText className="text-sm text-white">Enregistrer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView className="flex flex-row items-center justify-between">
          <ThemedView className="flex flex-row items-center">
            <ThemedView className={`mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {icon}
            </ThemedView>
            <ThemedView>
              <ThemedText className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</ThemedText>
              <ThemedText className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</ThemedText>
            </ThemedView>
          </ThemedView>
          {editable && (
            <TouchableOpacity 
              className={`p-2 rounded-full`}
              onPress={() => handleEdit(field, value)}
            >
              <ChevronRight size={20} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
            </TouchableOpacity>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
  
  // Composant pour les paramètres avec switch
  const SettingItem = ({ title, subtitle, value, onToggle, icon }) => (
    <ThemedView bordered variant = "surfaceVariant"  className={`p-2.5 mb-2 rounded-md`}>
      <ThemedView variant = "surfaceVariant" className="flex flex-row items-center justify-between">
        <ThemedView variant = "surfaceVariant" className="flex flex-row items-center flex-1">
          <ThemedView className="mr-3">
            {icon}
          </ThemedView>
          <ThemedView variant = "surfaceVariant" className="flex-1">
            <ThemedText className={`font-medium `}>{title}</ThemedText>
            {subtitle && (
              <ThemedText className={`text-xs mt-1 `}>{subtitle}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.accent, true:theme.primary}}
          thumbColor={value ? theme.surface: theme.background}
        />
      </ThemedView>
    </ThemedView>
  );
  
  // Composant pour les options de confidentialité
  const PrivacyOption = ({ title, subtitle, options, value, onSelect, icon }) => (
    <ThemedView className={`p-4 mb-2 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <ThemedView className="flex flex-row items-center justify-between mb-2">
        <ThemedView className="flex flex-row items-center flex-1">
          <ThemedView className="mr-3">
            {icon}
          </ThemedView>
          <ThemedView className="flex-1">
            <ThemedText className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</ThemedText>
            {subtitle && (
              <ThemedText className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ThemedView className="flex flex-row flex-wrap">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={`px-3 py-1 rounded-full mr-2 mb-2 ${
              value === option.value 
                ? (theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500')
                : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
            }`}
          >
            <ThemedText className={`text-sm ${
              value === option.value 
                ? 'text-white' 
                : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')
            }`}>
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );
  
  // Composant pour les éléments d'aide
  const HelpItem = ({ title, subtitle, onPress, icon }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`p-4 mb-2 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}
    >
      <ThemedView className="flex flex-row items-center justify-between">
        <ThemedView className="flex flex-row items-center flex-1">
          <ThemedView className="mr-3">
            {icon}
          </ThemedView>
          <ThemedView className="flex-1">
            <ThemedText className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</ThemedText>
            {subtitle && (
              <ThemedText className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        <ChevronRight size={20} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
      </ThemedView>
    </TouchableOpacity>
  );
  
 const renderNavigationTabs = () => (
    <ThemedView className={`border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <ThemedView className="flex flex-row">
        {[
          { id: 'notifications', label: 'Notifs', icon: <Bell size={18} /> },
          { id: 'privacy', label: 'Privé', icon: <Eye size={18} /> },
          { id: 'security', label: 'Sécurité', icon: <Shield size={18} /> },
          { id: 'help', label: 'Aide', icon: <HelpCircle size={18} /> }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveSection(tab.id)}
            className={`flex-1 px-2 py-3 items-center ${
              activeSection === tab.id 
                ? theme.blue50
                : 'transparent'
            }`}
          >
            <ThemedView className={`mb-1 ${
              activeSection === tab.id 
                ? theme.blue50
                : theme.blue600
            }`}>
              {tab.icon}
            </ThemedView>
            <ThemedText className={`text-xs ${
              activeSection === tab.id 
                ? theme.blue200
                : theme.blue600
            }`}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );
  
  // Rendu du contenu selon la section active
  const renderContent = () => {
    switch (activeSection) {
      
      case 'notifications':
        return (
          <ThemedView className = "h-full,  pb-10">
              <ThemedView className = "flex-row gap-8">
              <BackButton/>
              <ThemedText className = "mb-2" type="title">Notifications</ThemedText>
            </ThemedView>
            <ThemedText className={`mb-6`}>
              Gérez vos préférences de notification
            </ThemedText>
            
            <ThemedText>
              Notifications générales
            </ThemedText>
            
            <SettingItem
              title="Notifications push"
              subtitle="Recevoir des notifications push sur votre appareil"
              value={notifications.pushNotifications}
              onToggle={() => toggleNotification('pushNotifications')}
              icon={<Bell size={20} color={theme.blue600} />}
            />
            
            <SettingItem
              title="Notifications par email"
              subtitle="Recevoir des notifications par email"
              value={notifications.emailNotifications}
              onToggle={() => toggleNotification('emailNotifications')}
              icon={<Mail size={20} color= {theme.blue50}/>}
            />
            
            <SettingItem
              title="Notifications SMS"
              subtitle="Recevoir des notifications par SMS"
              value={notifications.smsNotifications}
              onToggle={() => toggleNotification('smsNotifications')}
              icon={<Phone size={20} color= {theme.blue50} />}
            />
            
            <ThemedText>
              Préférences sonores
            </ThemedText>
            
            <SettingItem
              title="Son des notifications"
              subtitle="Jouer un son lors des notifications"
              value={notifications.soundEnabled}
              onToggle={() => toggleNotification('soundEnabled')}
              icon={<Zap size={20} color= {theme.blue50} />}
            />
            
            <SettingItem
              title="Vibration"
              subtitle="Vibrer lors des notifications"
              value={notifications.vibrationEnabled}
              onToggle={() => toggleNotification('vibrationEnabled')}
              icon={<Settings size={20} color= {theme.blue50} />}
            />
            
            <ThemedText>
              Types de notifications
            </ThemedText>
            
            <SettingItem
              title="Messages"
              subtitle="Notifications pour les nouveaux messages"
              value={notifications.messageNotifications}
              onToggle={() => toggleNotification('messageNotifications')}
              icon={<MessageCircle size={20} color= {theme.blue50} />}
            />
            
            <SettingItem
              title="Demandes d'amis"
              subtitle="Notifications pour les demandes d'amis"
              value={notifications.friendRequestNotifications}
              onToggle={() => toggleNotification('friendRequestNotifications')}
              icon={<User size={20} color= {theme.blue50} />}
            />
            
            <SettingItem
              title="Notifications système"
              subtitle="Notifications importantes du système"
              value={notifications.systemNotifications}
              onToggle={() => toggleNotification('systemNotifications')}
              icon={<Shield size={20} color= {theme.blue50} />}
            />
          </ThemedView>
        );
      
      case 'privacy':
        return (
          <ThemedView>
            <ThemedView className = "flex-row gap-8">
              <BackButton/>
              <ThemedText type="title">Confidentialité</ThemedText>

            </ThemedView>
            <ThemedText className = "pb-2">
              Contrôlez qui peut voir vos informations
            </ThemedText>
            {/* <ThemedText>
              Visibilité du profil
            </ThemedText>
            
            <PrivacyOption
              title="Visibilité du profil"
              subtitle="Qui peut voir votre profil complet"
              options={[
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Amis' },
                { value: 'private', label: 'Privé' }
              ]}
              value={privacy.profileVisibility}
              onSelect={(value) => setPrivacyOption('profileVisibility', value)}
              icon={<Eye size={20} color= {theme.blue50} />}
            /> */}
            
            <ThemedText>
              Statut en ligne
            </ThemedText>
            
            <SettingItem
              title="Afficher le statut en ligne"
              subtitle="Permettre aux autres de voir si vous êtes en ligne"
              value={privacy.showOnlineStatus}
              onToggle={() => togglePrivacy('showOnlineStatus')}
              icon={<Globe size={20} color= {theme.blue50}/>}
            />
            
            <SettingItem
              title="Afficher la dernière connexion"
              subtitle="Permettre aux autres de voir votre dernière connexion"
              value={privacy.showLastSeen}
              onToggle={() => togglePrivacy('showLastSeen')}
              icon={<Eye size={20} color= {theme.blue50} />}
            />
            
            <ThemedText >
              Communications
            </ThemedText>
            
            <SettingItem
              title="Autoriser les messages directs"
              subtitle="Permettre aux autres de vous envoyer des messages privés"
              value={privacy.allowDirectMessages}
              onToggle={() => togglePrivacy('allowDirectMessages')}
              icon={<MessageCircle size={20} color= {theme.blue50} />}
            />
            
            <SettingItem
              title="Autoriser les demandes d'amis"
              subtitle="Permettre aux autres de vous envoyer des demandes d'amis"
              value={privacy.allowFriendRequests}
              onToggle={() => togglePrivacy('allowFriendRequests')}
              icon={<User size={20} color= {theme.blue50} />}
            />
            
            <ThemedText >
              Données et analytiques
            </ThemedText>
            
            <SettingItem
              title="Collecte de données"
              subtitle="Autoriser la collecte de données pour améliorer le service"
              value={privacy.dataCollection}
              onToggle={() => togglePrivacy('dataCollection')}
              icon={<Database size={20} color= {theme.blue50} />}
            />
            
            <SettingItem
              title="Analytiques"
              subtitle="Partager des données d'utilisation anonymes"
              value={privacy.analyticsEnabled}
              onToggle={() => togglePrivacy('analyticsEnabled')}
              icon={<Settings size={20} color= {theme.blue50}/>}
            />
          </ThemedView>
        );
      
      case 'security':
        return (
          <ThemedView>
            <ThemedView className = "flex-row gap-8">
              <BackButton/>
              <ThemedText type="title">Sécurité</ThemedText>
            </ThemedView>
            <ThemedText className={`mb-6`}>
              Protégez votre compte avec des mesures de sécurité
            </ThemedText>
            
            <ThemedText>
              Authentification
            </ThemedText>
            
            <ThemedView className={`p-4 mb-4 rounded-md `}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <Lock size={20} color={theme.blue200} />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Mot de passe</ThemedText>
                    <ThemedText>••••••••••</ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity className="p-2 rounded-full">
                  <ChevronRight size={20} color={theme.blue200} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <ThemedView className={`p-4 mb-4 rounded-md`}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <Shield size={20} color={theme.blue200} />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Authentification à deux facteurs</ThemedText>
                    <ThemedText >Désactivée</ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity className="p-2 rounded-full">
                  <ChevronRight size={20} color={theme.blue200}/>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <ThemedText>
              Sessions actives
            </ThemedText>
            
            <ThemedView className={`p-4 mb-4 rounded-md `}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <Settings size={20} color={theme.blue200} />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Appareil actuel</ThemedText>
                    <ThemedText >iPhone 14 Pro - Paris, France</ThemedText>
                    <ThemedText >Dernière activité: maintenant</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView className={`w-3 h-3 rounded-full bg-green-500`}></ThemedView>
              </ThemedView>
            </ThemedView>
            
            <ThemedView className={`p-4 mb-4 rounded-md `}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <Globe size={20} color={theme.blue200} />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Gérer les sessions</ThemedText>
                    <ThemedText >Voir toutes les sessions actives</ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity className="p-2 rounded-full">
                  <ChevronRight size={20} color={theme.blue200} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <ThemedText >
              Zone de danger
            </ThemedText>
            
            <ThemedView className={`p-4 mb-4 rounded-md `}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <LogOut size={20} color="#ed4245" />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Déconnecter de tous les appareils</ThemedText>
                    <ThemedText >
                      Fermer toutes les sessions actives sur tous les appareils
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity className={`px-3 py-1 rounded bg-red-500`}>
                  <ThemedText className="text-white text-sm">Déconnecter</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <ThemedView className={`p-4 mb-4 rounded-md `}>
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView className="flex-row items-center">
                  <ThemedView className="mr-3">
                    <Trash2 size={20} color="#ed4245" />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText >Supprimer mon compte</ThemedText>
                    <ThemedText >
                      Cette action est irréversible et supprimera toutes vos données.
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity className={`px-3 py-1 rounded bg-red-500`}>
                  <ThemedText className="text-white text-sm">Supprimer</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        );
      
      case 'help':
        return (
          <ThemedView>
            <ThemedText type="title">Aide & Support</ThemedText>
            <ThemedText >
              Trouvez de l'aide et contactez notre équipe de support
            </ThemedText>
            
            <ThemedText >
              Centre d'aide
            </ThemedText>
            
            <HelpItem
              title="FAQ"
              subtitle="Questions fréquemment posées"
              onPress={() => console.log('FAQ pressed')}
              icon={<HelpCircle size={20} color={theme.blue200}/>}
            />
            
            <HelpItem
              title="Guide d'utilisation"
              subtitle="Apprenez à utiliser toutes les fonctionnalités"
              onPress={() => console.log('Guide pressed')}
              icon={<FileText size={20} color={theme.blue200}/>}
            />
            
            <HelpItem
              title="Tutoriels vidéo"
              subtitle="Regardez des tutoriels pas à pas"
              onPress={() => console.log('Tutorials pressed')}
              icon={<Camera size={20} color={theme.blue200} />}
            />
            
            <ThemedText >
              Contactez-nous
            </ThemedText>
            
            <HelpItem
              title="Chat en direct"
              subtitle="Discutez avec notre équipe de support"
              onPress={() => console.log('Live chat pressed')}
              icon={<MessageCircle size={20} color={theme.blue200} />}
            />
            
            <HelpItem
              title="Envoyer un email"
              subtitle="Contactez-nous par email"
              onPress={() => console.log('Email pressed')}
              icon={<Mail size={20} color={theme.blue200} />}
            />
            
            <HelpItem
              title="Signaler un problème"
              subtitle="Signalez un bug ou un problème technique"
              onPress={() => console.log('Report pressed')}
              icon={<Zap size={20} color={theme.blue200} />}
            />
            
            <ThemedText >
              Données personnelles
            </ThemedText>
            
            <HelpItem
              title="Télécharger mes données"
              subtitle="Exportez toutes vos données personnelles"
              onPress={() => console.log('Download data pressed')}
              icon={<Download size={20} color={theme.blue200} />}
            />
            
            <HelpItem
              title="Politique de confidentialité"
              subtitle="Consultez notre politique de confidentialité"
              onPress={() => console.log('Privacy policy pressed')}
              icon={<Shield size={20} color={theme.blue200} />}
            />
            
            <HelpItem
              title="Conditions d'utilisation"
              subtitle="Lisez nos conditions d'utilisation"
              onPress={() => console.log('Terms pressed')}
              icon={<FileText size={20} color={theme.blue200} />}
            />
            
            <ThemedText >
              Partager l'application
            </ThemedText>
            
            <HelpItem
              title="Inviter des amis"
              subtitle="Partagez l'application avec vos amis"
              onPress={() => console.log('Invite pressed')}
              icon={<Share2 size={20} color={theme.blue200} />}
            />
            
            <ThemedView className={`p-4 mt-6 rounded-md `}>
              <ThemedText >
                Version 2.1.0
              </ThemedText>
              <ThemedText >
                Dernière mise à jour: 15 juillet 2025
              </ThemedText>
            </ThemedView>
          </ThemedView>
        );
      
      default:
        return null;
    }
  };
  
  return (
   <SafeAreaView className={`flex-1`}>
  <ThemedView className="flex-1 pt-10 px-2">
    {/* Contenu scrollable */}
    <ScrollView 
    showsVerticalScrollIndicator = {false}
    className="flex-1 p-4">
      {renderContent()}
    </ScrollView>

    {/* Tab bar fixe en bas */}
    <ThemedView className="mb-10">
      {renderNavigationTabs()}
    </ThemedView>
  </ThemedView>
</SafeAreaView>

  );
};

export default AccountPanel;


