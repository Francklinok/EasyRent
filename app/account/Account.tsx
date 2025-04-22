import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, Modal } from 'react-native';
import { 
  User, Mail, Phone, Lock, Shield, Trash2, LogOut, 
  ChevronRight, Camera, Zap, X, ChevronDown
} from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';


// Composant principal du panneau de compte
const AccountPanel = ({ theme = 'dark', onClose }) => {
  const [user, setUser] = useState({
    username: 'Utilisateur123',
    email: 'utilisateur@exemple.com',
    phone: '+33 6 12 34 56 78',
    status: 'En ligne',
    bio: 'Passionné de tech et de jeux vidéo',
    createdAt: 'Mai 2022'
  });
  
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [statusOptions] = useState(['En ligne', 'Ne pas déranger', 'Inactif', 'Invisible']);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
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
    <ThemedView >
      {editing === field ? (
        <ThemedView className="flex flex-col">
          <ThemedText className="themedtext-sm mb-1 ">{title}</ThemedText>
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
            <ThemedView className={`mr-3 ${theme === 'dark' ? 'themedtext-blue-400' : 'themedtext-blue-600'}`}>
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
  
  return (
    <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <ThemedView className="flex-1 flex-row">
        {/* Sidebar */}
        {/* <ThemedView className={`w-64 border-r ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'}`}>
          <ThemedView className={`p-4 border-b flex-row justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
            <ThemedText className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mon compte</ThemedText>
            <TouchableOpacity 
              className="p-1 rounded-full"
              onPress={onClose}
            >
              <X size={20} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView className="flex-1 p-4">
            <ThemedView className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <ThemedText className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Abonnement</ThemedText>
              <ThemedView className={`px-3 py-1 rounded-full flex-row items-center ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Zap size={14} color={theme === 'dark' ? '#00aff4' : '#5865f2'} className="mr-1" />
                <ThemedText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}>Discord Basic</ThemedText>
              </ThemedView>
              <TouchableOpacity className={`w-full mt-3 py-1 rounded-md ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <ThemedText className="text-white text-center text-sm">Passer à Premium</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedText className={`mt-2 mb-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mes serveurs</ThemedText>
            
            <TouchableOpacity className={`p-3 mb-2 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <ThemedView className="flex-row items-center">
                <ThemedView className={`w-8 h-8 rounded-full mr-2 ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-200'} items-center justify-center`}>
                  <ThemedText className={theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}>G</ThemedText>
                </ThemedView>
                <ThemedText className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Gaming Hub</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            
            <TouchableOpacity className={`p-3 mb-2 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <ThemedView className="flex-row items-center">
                <ThemedView className={`w-8 h-8 rounded-full mr-2 ${theme === 'dark' ? 'bg-green-900' : 'bg-green-200'} items-center justify-center`}>
                  <ThemedText className={theme === 'dark' ? 'text-green-300' : 'text-green-800'}>T</ThemedText>
                </ThemedView>
                <ThemedText className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Tech Talk</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ScrollView>
          
          <ThemedView className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-300'}`}>
            <TouchableOpacity className="flex-row items-center p-2">
              <LogOut size={18} color="#ed4245" className="mr-2" />
              <ThemedText className="text-red-500">Déconnexion</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView> */} 
        
        {/* Content */}
        <ScrollView className="flex-1 p-4">
          <ThemedText type = "title">Mon Profil</ThemedText>
          
          <ThemedView className="flex-row items-center mb-8">
            <ThemedView className="relative">
              <TouchableOpacity className="w-24 h-24 rounded-full, items-center justify-center overflow-hidden relative">
                <User size={48} color={theme.onSurface} />
                <ThemedView className="absolute inset-0 items-center justify-center opacity-0 ">
                  <Camera size={24} color="#ffffff" />
                </ThemedView>
              </TouchableOpacity>
              <ThemedView className="absolute bottom-0 right-0">
                <ThemedView className="relative">
                  <TouchableOpacity 
                    className="w-8 h-8 rounded-full items-center justify-center"
                    onPress={() => setShowStatusMenu(!showStatusMenu)}
                  >
                    <ThemedView className={`w-4 h-4 rounded-full ${getStatusColor(user.status)}`}></ThemedView>
                  </TouchableOpacity>
                  
                  <Modal
                    visible={showStatusMenu}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowStatusMenu(false)}
                  >
                    <TouchableOpacity 
                      className="flex-1 justify-end items-end p-2"
                      activeOpacity={1}
                      onPress={() => setShowStatusMenu(false)}
                    >
                      <ThemedView className="absolute bottom-24 right-24 w-48 rounded-md shadow-lg overflow-hidden">
                        {statusOptions.map(status => (
                          <TouchableOpacity 
                            key={status}
                            className="flex-row items-center p-3 "
                            onPress={() => setStatus(status)}
                          >
                            <ThemedView className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></ThemedView>
                            <ThemedText >{status}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ThemedView>
                    </TouchableOpacity>
                  </Modal>
                </ThemedView>
              </ThemedView>
            </ThemedView>
            <ThemedView className="ml-6">
              <ThemedText className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.username}</ThemedText>
              <ThemedView className={`flex-row items-center px-2 py-1 rounded-full ${
                user.status === 'En ligne' ? 
                  (theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100') : 
                user.status === 'Ne pas déranger' ?
                  (theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100') :
                user.status === 'Inactif' ?
                  (theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100') :
                  (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
              }`}>
                <ThemedView className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(user.status)}`}></ThemedView>
                <ThemedText className={`text-xs ${
                  user.status === 'En ligne' ? 
                    (theme === 'dark' ? 'text-green-400' : 'text-green-800') : 
                  user.status === 'Ne pas déranger' ?
                    (theme === 'dark' ? 'text-red-400' : 'text-red-800') :
                  user.status === 'Inactif' ?
                    (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800') :
                    (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                }`}>{user.status}</ThemedText>
              </ThemedView>
              <ThemedText className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Membre depuis {user.createdAt}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView className="p-4 mb-6 rounded-md ">
            <ThemedView className="flex-row justify-between items-start mb-2">
              <ThemedText type = "body">À propos de moi</ThemedText>
              <TouchableOpacity 
                className="p-1 rounded-full"
                onPress={() => handleEdit('bio', user.bio)}
              >
                <ChevronRight size={16} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
              </TouchableOpacity> 
            </ThemedView>
            {editing === 'bio' ? (
              <ThemedView className="flex-col">
                <TextInput 
                  value={editValue} 
                  onChangeText={setEditValue}
                  className={`mb-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                  multiline
                  numberOfLines={3}
                />
                <ThemedView className="flex-row justify-end space-x-2">
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
              <ThemedText className={theme === 'dark' ? 'themedtext-white' : 'text-gray-900'}>{user.bio}</ThemedText>
            )}
          </ThemedView>
          
          <ThemedText className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Informations personnelles</ThemedText>
          
          <ProfileSection 
            field="username" 
            title="Nom d'utilisateur" 
            value={user.username} 
            icon={<User size={20} color={theme === 'dark' ? '#00aff4' : '#5865f2'} />} 
          />
          
          <ProfileSection 
            field="email" 
            title="Adresse e-mail" 
            value={user.email} 
            icon={<Mail size={20} color={theme === 'dark' ? '#00aff4' : '#5865f2'} />} 
          />
          
          <ProfileSection 
            field="phone" 
            title="Numéro de téléphone" 
            value={user.phone} 
            icon={<Phone size={20} color={theme === 'dark' ? '#00aff4' : '#5865f2'} />} 
          />
          
          <ThemedText className={`font-semibold text-lg mb-4 mt-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sécurité</ThemedText>
          
          <ThemedView className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <ThemedView className="flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedView className="mr-3">
                  <Lock size={20} color={theme === 'dark' ? '#00aff4' : '#5865f2'} />
                </ThemedView>
                <ThemedView>
                  <ThemedText className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mot de passe</ThemedText>
                  <ThemedText className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>••••••••••</ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity className="p-2 rounded-full">
                <ChevronRight size={20} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
          
          <ThemedView className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <ThemedView className="flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedView className="mr-3">
                  <Shield size={20} color={theme === 'dark' ? '#00aff4' : '#5865f2'} />
                </ThemedView>
                <ThemedView>
                  <ThemedText className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Authentification à deux facteurs</ThemedText>
                  <ThemedText className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Désactivée</ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity className="p-2 rounded-full">
                <ChevronRight size={20} color={theme === 'dark' ? '#8e9297' : '#4f5660'} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
          
          <ThemedText className={`font-semibold text-lg mb-4 mt-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Zone de danger</ThemedText>
          
          <ThemedView className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 border border-red-900/30' : 'bg-red-100 border border-red-200'}`}>
            <ThemedView className="flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedView className="mr-3">
                  <Trash2 size={20} color="#ed4245" />
                </ThemedView>
                <ThemedView>
                  <ThemedText className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>Supprimer mon compte</ThemedText>
                  <ThemedText className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cette action est irréversible et supprimera toutes vos données.
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity className={`px-3 py-1 rounded bg-red-500`}>
                <ThemedText className="themedtext-white">Supprimer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default AccountPanel;