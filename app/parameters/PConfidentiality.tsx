import React, { useState } from 'react';
import { View, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, Eye, Bell, Lock, Volume2, Palette, Sliders, Zap, LogOut, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('privacy');
  const [settings, setSettings] = useState({
    messages: true,
    dataCollection: false,
    personalizedContent: true,
    twoFactorAuth: false,
    notifications: true,
    sounds: true,
    status: true
  });

  const { theme } = useTheme();

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { key: 'privacy', icon: <Shield size={20} />, label: 'Confidentialité & Sécurité' },
    { key: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { key: 'audio', icon: <Volume2 size={20} />, label: 'Audio' },
    { key: 'appearance', icon: <Palette size={20} />, label: 'Apparence' },
    { key: 'accessibility', icon: <Sliders size={20} />, label: 'Accessibilité' },
    { key: 'advanced', icon: <Zap size={20} />, label: 'Avancé' }
  ];

  const SettingItem = ({ icon, title, description, value, onChange }) => (
    <ThemedView style={[styles.settingItem, theme === 'dark' ? styles.bgDark : styles.bgLight]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitle}>
          <View style={theme === 'dark' ? styles.iconDark : styles.iconLight}>{icon}</View>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        </View>
        <Switch value={value} onValueChange={onChange} />
      </View>
      <ThemedText style={styles.settingDescription}>{description}</ThemedText>
    </ThemedView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <>
            <ThemedText style={styles.sectionTitle}>Confidentialité & Sécurité</ThemedText>
            <SettingItem
              icon={<Eye size={20} />}
              title="Messages privés"
              description="Autoriser les messages provenant des membres du serveur"
              value={settings.messages}
              onChange={() => toggleSetting('messages')}
            />
            <SettingItem
              icon={<Shield size={20} />}
              title="Collection de données"
              description="Nous permettre de collecter des données anonymes pour améliorer l'application"
              value={settings.dataCollection}
              onChange={() => toggleSetting('dataCollection')}
            />
            <SettingItem
              icon={<Bell size={20} />}
              title="Contenu personnalisé"
              description="Recevoir des recommandations basées sur vos activités"
              value={settings.personalizedContent}
              onChange={() => toggleSetting('personalizedContent')}
            />
            <SettingItem
              icon={<Lock size={20} />}
              title="Authentification à deux facteurs"
              description="Renforcer la sécurité de votre compte avec une vérification supplémentaire"
              value={settings.twoFactorAuth}
              onChange={() => toggleSetting('twoFactorAuth')}
            />
            <ThemedView style={theme === 'dark' ? styles.dangerDark : styles.dangerLight}>
              <ThemedText style={theme === 'dark' ? styles.dangerTitleDark : styles.dangerTitleLight}>Zone de danger</ThemedText>
              <ThemedText style={styles.dangerDescription}>Ces actions sont irréversibles.</ThemedText>
              <TouchableOpacity style={theme === 'dark' ? styles.deleteBtnDark : styles.deleteBtnLight}>
                <Trash2 size={16} color="#fff" />
                <ThemedText style={styles.deleteText}>Supprimer mon compte</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        );
      case 'notifications':
        return (
          <>
            <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
            <SettingItem
              icon={<Bell size={20} />}
              title="Notifications push"
              description="Recevoir des notifications push sur cet appareil"
              value={settings.notifications}
              onChange={() => toggleSetting('notifications')}
            />
            <SettingItem
              icon={<Volume2 size={20} />}
              title="Sons de notification"
              description="Jouer un son lors de la réception d'une notification"
              value={settings.sounds}
              onChange={() => toggleSetting('sounds')}
            />
          </>
        );
      default:
        return (
          <View style={styles.centered}>
            <Zap size={48} color={theme === 'dark' ? '#666' : '#aaa'} />
            <ThemedText style={styles.devTitle}>Section en développement</ThemedText>
            <ThemedText style={styles.devText}>Cette fonctionnalité sera bientôt disponible</ThemedText>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={theme === 'dark' ? styles.sidebarDark : styles.sidebarLight}>
        <ScrollView>
          {tabs.map(({ key, icon, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tabButton,
                activeTab === key && (theme === 'dark' ? styles.activeTabDark : styles.activeTabLight)
              ]}
              onPress={() => setActiveTab(key)}
            >
              <View style={{ marginRight: 8 }}>{icon}</View>
              <ThemedText>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={18} style={{ marginRight: 8 }} />
          <ThemedText style={styles.logoutText}>Déconnexion</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{renderTabContent()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebarDark: { width: 200, backgroundColor: '#111', paddingVertical: 10 },
  sidebarLight: { width: 200, backgroundColor: '#f0f0f0', paddingVertical: 10 },
  tabButton: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 16 },
  activeTabDark: { backgroundColor: '#222' },
  activeTabLight: { backgroundColor: '#ddd' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 20 },
  logoutText: { color: '#e63946' },
  content: { flexGrow: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  settingItem: { padding: 16, borderRadius: 8, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { flexDirection: 'row', alignItems: 'center' },
  iconDark: { color: '#60a5fa', marginRight: 8 },
  iconLight: { color: '#2563eb', marginRight: 8 },
  settingTitle: { fontWeight: 'bold', fontSize: 16 },
  settingDescription: { marginTop: 4, fontSize: 13 },
  dangerDark: { padding: 16, borderRadius: 8, backgroundColor: '#441111' },
  dangerLight: { padding: 16, borderRadius: 8, backgroundColor: '#fee2e2' },
  dangerTitleDark: { color: '#f87171', fontWeight: 'bold', marginBottom: 4 },
  dangerTitleLight: { color: '#b91c1c', fontWeight: 'bold', marginBottom: 4 },
  dangerDescription: { marginBottom: 10, fontSize: 13 },
  deleteBtnDark: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#991b1b', padding: 10, borderRadius: 6 },
  deleteBtnLight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', padding: 10, borderRadius: 6 },
  deleteText: { color: 'white', marginLeft: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  devTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  devText: { fontSize: 14, marginTop: 4 }
});

export default SettingsPanel;
