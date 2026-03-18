import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, View, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { BackButton } from '@/components/ui/BackButton';
import { useAccountSettings } from '@/hooks/useSettings';
import { router } from 'expo-router';

export default function AccountSetting() {
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const userId = user?.id || '';

  const {
    settings,
    loading,
    actionLoading,
    updateProfile,
    deleteAccount,
    exportData,
  } = useAccountSettings(userId);

  const backgroundColor = Array.isArray(theme.background) ? theme.background[0] : theme.background;

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Edit form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const handleOpenEditModal = useCallback(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setUsername(settings?.username || '');
    setPhoneNumber(settings?.phoneNumber || '');
    setShowEditModal(true);
  }, [user, settings]);

  const handleUpdateProfile = useCallback(async () => {
    const updates: any = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (username && username !== settings?.username) updates.username = username;
    if (phoneNumber && phoneNumber !== settings?.phoneNumber) updates.phoneNumber = phoneNumber;

    if (Object.keys(updates).length === 0) {
      Alert.alert('Info', 'Aucune modification à enregistrer');
      return;
    }

    const result = await updateProfile(updates);
    if (result) {
      Alert.alert(t('common.success'), 'Profil mis à jour avec succès');
      setShowEditModal(false);
    } else {
      Alert.alert(t('common.error'), 'Échec de la mise à jour');
    }
  }, [firstName, lastName, username, phoneNumber, settings, updateProfile, t]);

  const handleExportData = useCallback(async () => {
    const result = await exportData();
    if (result?.success) {
      setExportUrl(result.downloadUrl);
      setShowExportModal(true);
    } else {
      Alert.alert(t('common.error'), 'Échec de l\'export des données');
    }
  }, [exportData, t]);

  const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword) {
      Alert.alert(t('common.error'), 'Veuillez entrer votre mot de passe');
      return;
    }

    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount(deletePassword, deleteReason || undefined);
            if (result.success) {
              setShowDeleteModal(false);
              Alert.alert(t('common.success'), 'Compte supprimé avec succès');
              logout();
              router.replace('/');
            } else {
              Alert.alert(t('common.error'), result.message);
            }
          }
        }
      ]
    );
  }, [deletePassword, deleteReason, deleteAccount, logout, t]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 12 }}>{t('common.loading')}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : [theme.primary, theme.secondary || theme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <ThemedView style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          padding: 16,
          gap: 12,
          backgroundColor: 'transparent'
        }}>
          <BackButton />
          <ThemedText type="title" style={{ fontSize: 20, color: '#FFFFFF' }}>
            {t('profile.accountSettings') || 'Paramètres du compte'}
          </ThemedText>
        </ThemedView>

        {/* User Avatar */}
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.4)'
          }}>
            <ThemedText style={{ fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' }}>
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <ThemedText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 8 }}>
            {user?.firstName} {user?.lastName}
          </ThemedText>
          <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            @{settings?.username || 'utilisateur'}
          </ThemedText>
        </View>
      </LinearGradient>

      <ThemedScrollView style={{ flex: 1 }}>
        <ThemedView style={{ padding: 16 }}>
          {/* Account Info Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              INFORMATIONS DU COMPTE
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              {/* Email */}
              <ThemedView style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline + '20'
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="email" size={22} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Email</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
                      {settings?.email || user?.email}
                    </ThemedText>
                    {settings?.isEmailVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color={theme.success} />
                    )}
                  </View>
                </View>
              </ThemedView>

              {/* Phone */}
              <ThemedView style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline + '20'
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.secondary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="phone" size={22} color={theme.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Téléphone</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
                      {settings?.phoneNumber || 'Non renseigné'}
                    </ThemedText>
                    {settings?.isPhoneVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color={theme.success} />
                    )}
                  </View>
                </View>
              </ThemedView>

              {/* Username */}
              <ThemedView style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline + '20'
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="at" size={22} color={theme.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Nom d'utilisateur</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
                    @{settings?.username || 'utilisateur'}
                  </ThemedText>
                </View>
              </ThemedView>

              {/* Member since */}
              <ThemedView style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: 16
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="calendar" size={22} color={theme.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Membre depuis</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
                    {formatDate(settings?.createdAt || null)}
                  </ThemedText>
                </View>
              </ThemedView>
            </ThemedView>

            {/* Edit Profile Button */}
            <TouchableOpacity
              onPress={handleOpenEditModal}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 20
              }}
            >
              <MaterialCommunityIcons name="account-edit" size={20} color="#FFFFFF" />
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                Modifier le profil
              </ThemedText>
            </TouchableOpacity>
          </MotiView>

          {/* Activity Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              ACTIVITÉ
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center'
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="clock-outline" size={22} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Dernière connexion</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
                    {formatDate(settings?.lastLogin || null)}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          </MotiView>

          {/* Data Management Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              GESTION DES DONNÉES
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              {/* Export Data */}
              <TouchableOpacity
                onPress={handleExportData}
                disabled={actionLoading}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="download" size={22} color={theme.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    Exporter mes données
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    Télécharger une copie de vos données
                  </ThemedText>
                </View>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
                )}
              </TouchableOpacity>

              {/* Download Data */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Info', 'Historique des téléchargements de données');
                }}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16
                }}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.secondary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="history" size={22} color={theme.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    Historique des exports
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    Voir vos exports précédents
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>
            </ThemedView>
          </MotiView>

          {/* Danger Zone */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.error,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              ZONE DANGEREUSE
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.error + '30',
              overflow: 'hidden'
            }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(true)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16
                }}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.error + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="delete-forever" size={22} color={theme.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.error }}>
                    {t('profile.deleteAccount')}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    Cette action est irréversible
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.error} />
              </TouchableOpacity>
            </ThemedView>
          </MotiView>
        </ThemedView>
      </ThemedScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          <ThemedView style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20'
          }}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="title" style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>
              Modifier le profil
            </ThemedText>
            <View style={{ width: 24 }} />
          </ThemedView>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={{ gap: 16 }}>
              <View>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Prénom</ThemedText>
                <TextInput
                  placeholder="Votre prénom"
                  placeholderTextColor={theme.typography.caption}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.text,
                    fontSize: 16
                  }}
                />
              </View>

              <View>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Nom</ThemedText>
                <TextInput
                  placeholder="Votre nom"
                  placeholderTextColor={theme.typography.caption}
                  value={lastName}
                  onChangeText={setLastName}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.text,
                    fontSize: 16
                  }}
                />
              </View>

              <View>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Nom d'utilisateur</ThemedText>
                <TextInput
                  placeholder="@username"
                  placeholderTextColor={theme.typography.caption}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.text,
                    fontSize: 16
                  }}
                />
              </View>

              <View>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Téléphone</ThemedText>
                <TextInput
                  placeholder="+33 6 00 00 00 00"
                  placeholderTextColor={theme.typography.caption}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.text,
                    fontSize: 16
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={actionLoading}
                style={{
                  backgroundColor: theme.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 8
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Enregistrer les modifications
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24
        }}>
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.error + '20',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16
            }}>
              <MaterialCommunityIcons name="alert" size={32} color={theme.error} />
            </View>

            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8 }}>
              Supprimer le compte
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', color: theme.typography.caption, marginBottom: 20 }}>
              Cette action supprimera définitivement toutes vos données. Entrez votre mot de passe pour confirmer.
            </ThemedText>

            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor={theme.typography.caption}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              style={{
                backgroundColor: backgroundColor,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                marginBottom: 12
              }}
            />

            <TextInput
              placeholder="Raison (optionnel)"
              placeholderTextColor={theme.typography.caption}
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: backgroundColor,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                marginBottom: 20,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteReason('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: theme.outline + '20',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ fontWeight: '600' }}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  backgroundColor: theme.error,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ fontWeight: '600', color: '#FFFFFF' }}>Supprimer</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Export Success Modal */}
      <Modal
        visible={showExportModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24
        }}>
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.success + '20',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16
            }}>
              <MaterialCommunityIcons name="check-circle" size={32} color={theme.success} />
            </View>

            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8 }}>
              Export prêt !
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', color: theme.typography.caption, marginBottom: 20 }}>
              Votre archive de données est prête à être téléchargée.
            </ThemedText>

            <TouchableOpacity
              onPress={() => {
                setShowExportModal(false);
                // Open download URL
              }}
              style={{
                backgroundColor: theme.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
              <ThemedText style={{ fontWeight: '600', color: '#FFFFFF' }}>Télécharger</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowExportModal(false)}
              style={{
                padding: 16,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <ThemedText style={{ color: theme.typography.caption }}>Fermer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

      {/* Loading overlay */}
      {actionLoading && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <ThemedText style={{ color: '#FFFFFF', fontSize: 12 }}>Chargement...</ThemedText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
