import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import ItemData from '@/components/info/index';
import Atout from '@/components/info/atoutFils';
import Criteria from '@/components/info/criteriaFile';
import Services from '@/components/info/servicesFiles';
import Equipment from '@/components/info/equipmentFiles';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { BackButton } from '@/components/ui/BackButton';
import data from '@/assets/data/data';
import enrichItems from '@/components/utils/homeUtils/extendData';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

interface ComponentProps {
  itemData?: any;
}

// Composant pour les badges animés
const AnimatedBadge = ({ children, isActive, onPress }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Info() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();

  const extendedData = useMemo(() => enrichItems(data), []);
  const currentItem = useMemo(() => extendedData.find(item => item.id === id), [extendedData, id]);

  const [activeComponent, setActiveComponent] = useState<string>('Description');

  const componentMap: Record<string, { 
    component: React.ComponentType<ComponentProps>, 
    icon: string, 
    iconLib: string,
    gradient: string[] 
  }> = useMemo(
    () => ({
      Description: { 
        component: ItemData, 
        icon: 'description', 
        iconLib: 'MaterialIcons',
        gradient: ['#667eea', '#764ba2']
      },
      Criteria: { 
        component: Criteria, 
        icon: 'checklist', 
        iconLib: 'Octicons',
        gradient: ['#f093fb', '#f5576c']
      },
      Atout: { 
        component: Atout, 
        icon: 'star', 
        iconLib: 'AntDesign',
        gradient: ['#4facfe', '#00f2fe']
      },
      Equipment: { 
        component: Equipment, 
        icon: 'build', 
        iconLib: 'MaterialIcons',
        gradient: ['#43e97b', '#38f9d7']
      },
      Services: { 
        component: Services, 
        icon: 'room-service', 
        iconLib: 'MaterialIcons',
        gradient: ['#fa709a', '#fee140']
      },
    }),
    []
  );

  const ActiveComponent = componentMap[activeComponent]?.component;

  const renderIcon = (iconLib: string, iconName: string, size: number, color: string) => {
    switch (iconLib) {
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      case 'Octicons':
        return <Octicons name={iconName as any} size={size} color={color} />;
      case 'AntDesign':
        return <AntDesign name={iconName as any} size={size} color={color} />;
      default:
        return <MaterialIcons name="description" size={size} color={color} />;
    }
  };

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.errorContainer}
        >
          <MaterialIcons name="error-outline" size={64} color="white" />
          <ThemedText style={styles.errorText}>Item non trouvé</ThemedText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* HEADER avec gradient et glassmorphism */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <BlurView intensity={20} tint="light" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <BackButton />
            
            {/* Avatar avec effet glow */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow}>
                <Image
                  source={{ uri: currentItem.owner?.avatar ?? 'https://picsum.photos/200/200' }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
              <View style={styles.onlineIndicator} />
            </View>

            {/* Info propriétaire */}
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>
                {currentItem.owner?.name || 'Propriétaire'}
              </Text>
              <View style={styles.responseRate}>
                <MaterialIcons name="verified" size={16} color="#10B981" />
                <Text style={styles.responseText}>
                  Taux de réponse{' '}
                  <Text style={styles.responsePercent}>100%</Text>
                </Text>
              </View>
            </View>

            {/* Actions avec effet glassmorphism */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <BlurView intensity={15} tint="light" style={styles.actionButtonBlur}>
                  <Octicons name="verified" size={20} color="white" />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <BlurView intensity={15} tint="light" style={styles.actionButtonBlur}>
                  <AntDesign name="message1" size={20} color="white" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Onglets avec design moderne */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {Object.entries(componentMap).map(([key, config]) => {
            const isActive = activeComponent === key;
            return (
              <AnimatedBadge
                key={key}
                isActive={isActive}
                onPress={() => setActiveComponent(key)}
              >
                <View style={styles.tabWrapper}>
                  {isActive ? (
                    <LinearGradient
                      colors={config.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeTab}
                    >
                      <View style={styles.tabContent}>
                        {renderIcon(config.iconLib, config.icon, 16, 'white')}
                        <Text style={styles.activeTabText}>{key}</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.inactiveTab, { backgroundColor: theme.surface }]}>
                      <View style={styles.tabContent}>
                        {renderIcon(config.iconLib, config.icon, 16, theme.onSurface)}
                        <Text style={[styles.inactiveTabText, { color: theme.onSurface }]}>
                          {key}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </AnimatedBadge>
            );
          })}
        </ScrollView>
      </View>

      {/* Contenu avec animation */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.contentWrapper}>
          {ActiveComponent ? (
            <ActiveComponent itemData={currentItem} />
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialIcons name="inbox" size={48} color={theme.outline} />
              <ThemedText style={[styles.noDataText, { color: theme.outline }]}>
                Aucune donnée disponible
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24,
    paddingBottom: 10,
  },
  headerBlur: {
    // flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 14,
  },
  avatarGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  responseRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  responsePercent: {
    color: '#10B981',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeTab: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  inactiveTab: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  inactiveTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
  },
});