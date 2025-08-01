import React, { useState } from 'react';
import { TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useUser } from '@/components/contexts/user/UserContext';

const ROLE_OPTIONS = [
  { key: 'buyer', label: 'Acheteur', icon: 'home-search' },
  { key: 'seller', label: 'Vendeur', icon: 'home-export' },
  { key: 'renter', label: 'Locataire', icon: 'key' },
  { key: 'owner', label: 'Propriétaire', icon: 'home-account' },
  { key: 'agent', label: 'Agent', icon: 'account-tie' },
  { key: 'developer', label: 'Promoteur', icon: 'office-building' }
];

export const AccountComponent: React.FC = () => {
  const { theme } = useTheme();
  const { user, updateProfile, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'buyer'
  });

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: logout, style: 'destructive' }
      ]
    );
  };

  if (!user) return null;

  return (
    <ThemedView style={{ flex: 1, padding: 20, gap: 20 }}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
      >
        <LinearGradient
          colors={[theme.primary, theme.secondary || theme.primary + '80']}
          style={{
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: 'white'
            }}
          />
          <ThemedText style={{ color: 'white', fontSize: 24, fontWeight: '900', marginTop: 12 }}>
            {user.name}
          </ThemedText>
          <ThemedView style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            marginTop: 8
          }}>
            <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              {ROLE_OPTIONS.find(r => r.key === user.role)?.label}
            </ThemedText>
          </ThemedView>
          {user.isPremium && (
            <ThemedView style={{
              backgroundColor: '#FFD700',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}>
              <MaterialCommunityIcons name="crown" size={16} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                PREMIUM
              </ThemedText>
            </ThemedView>
          )}
        </LinearGradient>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200, type: 'spring' }}
      >
        <TouchableOpacity
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons 
              name={isEditing ? "check" : "pencil"} 
              size={20} 
              color={theme.primary} 
            />
            <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
              {isEditing ? 'Sauvegarder' : 'Modifier le profil'}
            </ThemedText>
          </ThemedView>
          {isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={{ padding: 4 }}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.error} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400, type: 'spring' }}
        style={{ gap: 16 }}
      >
        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 16
        }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.typography.caption }}>
            Nom complet
          </ThemedText>
          {isEditing ? (
            <TextInput
              value={editData.name}
              onChangeText={(text) => setEditData({...editData, name: text})}
              style={{
                fontSize: 16,
                color: theme.typography.body,
                backgroundColor: theme.surfaceVariant + '30',
                borderRadius: 8,
                padding: 12
              }}
            />
          ) : (
            <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
              {user.name}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 16
        }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.typography.caption }}>
            Email
          </ThemedText>
          {isEditing ? (
            <TextInput
              value={editData.email}
              onChangeText={(text) => setEditData({...editData, email: text})}
              keyboardType="email-address"
              style={{
                fontSize: 16,
                color: theme.typography.body,
                backgroundColor: theme.surfaceVariant + '30',
                borderRadius: 8,
                padding: 12
              }}
            />
          ) : (
            <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
              {user.email}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 16
        }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.typography.caption }}>
            Téléphone
          </ThemedText>
          {isEditing ? (
            <TextInput
              value={editData.phone}
              onChangeText={(text) => setEditData({...editData, phone: text})}
              keyboardType="phone-pad"
              style={{
                fontSize: 16,
                color: theme.typography.body,
                backgroundColor: theme.surfaceVariant + '30',
                borderRadius: 8,
                padding: 12
              }}
            />
          ) : (
            <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
              {user.phone}
            </ThemedText>
          )}
        </ThemedView>

        {isEditing && (
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16
          }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12, color: theme.typography.caption }}>
              Rôle
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ROLE_OPTIONS.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  onPress={() => setEditData({...editData, role: role.key as any})}
                  style={{
                    backgroundColor: editData.role === role.key ? theme.primary : theme.surfaceVariant + '30',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <MaterialCommunityIcons 
                    name={role.icon as any} 
                    size={16} 
                    color={editData.role === role.key ? 'white' : theme.typography.body} 
                  />
                  <ThemedText style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: editData.role === role.key ? 'white' : theme.typography.body
                  }}>
                    {role.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 800, type: 'spring' }}
      >
        <TouchableOpacity onPress={handleLogout}>
          <ThemedView style={{
            backgroundColor: theme.error + '10',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12
          }}>
            <MaterialCommunityIcons name="logout" size={20} color={theme.error} />
            <ThemedText style={{ color: theme.error, fontSize: 16, fontWeight: '700' }}>
              Se déconnecter
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </MotiView>
    </ThemedView>
  );
};