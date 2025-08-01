import React, { useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useUser } from '@/components/contexts/user/UserContext';
import { formatCurrency } from '@/components/utils/walletUtils';

const PREMIUM_FEATURES = [
  { icon: 'star', title: 'Accès prioritaire', description: 'Voir les nouvelles propriétés en premier' },
  { icon: 'eye', title: 'Vues illimitées', description: 'Consultez autant de propriétés que vous voulez' },
  { icon: 'heart', title: 'Favoris illimités', description: 'Sauvegardez toutes vos propriétés préférées' },
  { icon: 'phone', title: 'Contact direct', description: 'Contactez directement les propriétaires' },
  { icon: 'chart-line', title: 'Analyses avancées', description: 'Statistiques détaillées du marché' },
  { icon: 'shield-check', title: 'Support premium', description: 'Assistance prioritaire 24/7' }
];

export const PremiumComponent: React.FC = () => {
  const { theme } = useTheme();
  const { user, wallet, upgradeToPremium, checkPremiumStatus } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const isPremium = checkPremiumStatus();
  const premiumPrice = 29.99;

  const handleUpgrade = async () => {
    if (wallet.balance < premiumPrice) {
      Alert.alert(
        'Solde insuffisant',
        `Vous avez besoin de ${formatCurrency(premiumPrice)} pour passer Premium. Votre solde actuel: ${formatCurrency(wallet.balance)}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmer l\'abonnement',
      `Passer à Premium pour ${formatCurrency(premiumPrice)}/mois ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setIsLoading(true);
            const success = await upgradeToPremium();
            setIsLoading(false);

            if (success) {
              Alert.alert('Félicitations!', 'Vous êtes maintenant Premium!');
            } else {
              Alert.alert('Erreur', 'Impossible de passer à Premium');
            }
          }
        }
      ]
    );
  };

  if (isPremium) {
    return (
      <ThemedView style={{ padding: 20, gap: 20 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={{
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <MaterialCommunityIcons name="crown" size={48} color="white" />
            <ThemedText style={{ color: 'white', fontSize: 24, fontWeight: '900', marginTop: 12 }}>
              Vous êtes Premium!
            </ThemedText>
            <ThemedText style={{ color: 'white', opacity: 0.9, textAlign: 'center', marginTop: 8 }}>
              Profitez de tous les avantages Premium
            </ThemedText>
            {user?.premiumExpiry && (
              <ThemedText style={{ color: 'white', opacity: 0.8, fontSize: 12, marginTop: 8 }}>
                Expire le: {new Date(user.premiumExpiry).toLocaleDateString('fr-FR')}
              </ThemedText>
            )}
          </LinearGradient>
        </MotiView>

        <ThemedText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
          Vos avantages Premium
        </ThemedText>

        {PREMIUM_FEATURES.map((feature, index) => (
          <MotiView
            key={feature.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: index * 100, type: 'spring' }}
          >
            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: '#FFD700' + '30'
            }}>
              <ThemedView style={{
                backgroundColor: '#FFD700' + '20',
                borderRadius: 12,
                padding: 12
              }}>
                <FontAwesome5 name={feature.icon} size={20} color="#FFD700" />
              </ThemedView>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '700', fontSize: 16 }}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={{ color: theme.typography.caption, marginTop: 4 }}>
                  {feature.description}
                </ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
            </ThemedView>
          </MotiView>
        ))}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ padding: 20, gap: 20 }}>
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
          <MaterialCommunityIcons name="crown-outline" size={48} color="white" />
          <ThemedText style={{ color: 'white', fontSize: 24, fontWeight: '900', marginTop: 12 }}>
            Passez Premium
          </ThemedText>
          <ThemedText style={{ color: 'white', opacity: 0.9, textAlign: 'center', marginTop: 8 }}>
            Débloquez toutes les fonctionnalités avancées
          </ThemedText>
          <ThemedText style={{ color: 'white', fontSize: 32, fontWeight: '900', marginTop: 16 }}>
            {formatCurrency(premiumPrice)}/mois
          </ThemedText>
        </LinearGradient>
      </MotiView>

      <ThemedText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        Avantages Premium
      </ThemedText>

      {PREMIUM_FEATURES.map((feature, index) => (
        <MotiView
          key={feature.title}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: index * 100, type: 'spring' }}
        >
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16
          }}>
            <ThemedView style={{
              backgroundColor: theme.primary + '20',
              borderRadius: 12,
              padding: 12
            }}>
              <FontAwesome5 name={feature.icon} size={20} color={theme.primary} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: '700', fontSize: 16 }}>
                {feature.title}
              </ThemedText>
              <ThemedText style={{ color: theme.typography.caption, marginTop: 4 }}>
                {feature.description}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </MotiView>
      ))}

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 800, type: 'spring' }}
      >
        <TouchableOpacity
          onPress={handleUpgrade}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={{
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="crown" size={24} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>
                Passer Premium - {formatCurrency(premiumPrice)}
              </ThemedText>
            </ThemedView>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>

      <ThemedView style={{
        backgroundColor: theme.surfaceVariant + '30',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
      }}>
        <ThemedText style={{ fontSize: 14, color: theme.typography.caption, textAlign: 'center' }}>
          Votre solde actuel: {formatCurrency(wallet.balance)}
        </ThemedText>
        {wallet.balance < premiumPrice && (
          <ThemedText style={{ fontSize: 12, color: theme.error, textAlign: 'center', marginTop: 4 }}>
            Solde insuffisant pour passer Premium
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
};