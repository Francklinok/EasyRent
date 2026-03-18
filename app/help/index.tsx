import React, { useState } from 'react';
import { TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { BackButton } from '@/components/ui/BackButton';
import { MotiView } from 'moti';

interface FAQItem {
  question: string;
  answer: string;
  icon: string;
}

const HelpScreen = () => {
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Comment créer une propriété ?',
      answer: 'Pour créer une propriété, accédez à l\'onglet "Home", appuyez sur le bouton "+" en haut à droite et remplissez le formulaire avec les informations de votre propriété.',
      icon: 'home-plus'
    },
    {
      question: 'Comment activer les paiements crypto ?',
      answer: 'Dans le portefeuille, activez le toggle "Crypto" pour afficher vos balances Bitcoin, Ethereum et USDT. Lors de la création d\'une propriété, activez l\'option crypto dans l\'étape de tarification.',
      icon: 'bitcoin'
    },
    {
      question: 'Comment réserver une propriété ?',
      answer: 'Consultez les détails de la propriété, demandez une visite si nécessaire, puis suivez le processus de réservation qui inclut le téléchargement de documents et le paiement.',
      icon: 'calendar-check'
    },
    {
      question: 'Où trouver mes favoris ?',
      answer: 'Vos propriétés favorites sont accessibles via l\'onglet "Favoris" dans le menu de navigation ou via les paramètres.',
      icon: 'heart'
    },
    {
      question: 'Comment modifier mon profil ?',
      answer: 'Accédez à Paramètres > Mon Profil pour modifier vos informations personnelles, photo de profil et coordonnées.',
      icon: 'account-edit'
    },
    {
      question: 'Comment activer la 2FA ?',
      answer: 'Allez dans Paramètres > Sécurité et activez l\'authentification à deux facteurs pour renforcer la sécurité de votre compte.',
      icon: 'shield-check'
    },
    {
      question: 'Comment exporter mes données ?',
      answer: 'Dans Paramètres > Stockage & Données > Exporter mes données. Vous recevrez un email avec toutes vos données sous 24h (conformité RGPD).',
      icon: 'download'
    },
    {
      question: 'Comment contacter le support ?',
      answer: 'Utilisez le formulaire de contact ci-dessous ou envoyez un email directement à support@easyrent.com',
      icon: 'email'
    }
  ];

  const contactMethods = [
    {
      label: 'Email',
      value: 'support@easyrent.com',
      icon: 'email',
      color: theme.primary,
      action: () => Linking.openURL('mailto:support@easyrent.com')
    },
    {
      label: 'WhatsApp',
      value: '+33 6 12 34 56 78',
      icon: 'whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/33612345678')
    },
    {
      label: 'Téléphone',
      value: '+33 1 23 45 67 89',
      icon: 'phone',
      color: theme.success,
      action: () => Linking.openURL('tel:+33123456789')
    },
    {
      label: 'Chat en direct',
      value: 'Disponible 24/7',
      icon: 'chat',
      color: theme.info,
      action: () => Alert.alert('Chat', 'Le chat en direct sera bientôt disponible')
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.secondary || theme.primary + '80']}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
          <BackButton iconColor="white" />
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              Centre d'aide
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              Nous sommes là pour vous aider
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      <ThemedScrollView style={{ flex: 1 }}>
        {/* Search Suggestion */}
        <ThemedView style={{ padding: 16 }}>
          <ThemedView style={{
            backgroundColor: theme.primary + '10',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.primary + '30'
          }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.primary} />
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 2 }}>
                  Astuce
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                  Utilisez la recherche globale pour trouver rapidement des réponses
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* FAQs */}
        <ThemedView style={{ padding: 16 }}>
          <ThemedText style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
            color: theme.typography.heading
          }}>
            Questions fréquentes
          </ThemedText>

          <ThemedView style={{ gap: 8 }}>
            {faqs.map((faq, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
              >
                <TouchableOpacity
                  onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: expandedIndex === index ? theme.primary : theme.outline + '20'
                  }}
                >
                  <ThemedView style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    gap: 12
                  }}>
                    <ThemedView style={{
                      backgroundColor: theme.primary + '20',
                      borderRadius: 10,
                      padding: 8
                    }}>
                      <MaterialCommunityIcons
                        name={faq.icon as any}
                        size={20}
                        color={theme.primary}
                      />
                    </ThemedView>

                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <ThemedText style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: theme.typography.body
                      }}>
                        {faq.question}
                      </ThemedText>
                    </ThemedView>

                    <MaterialCommunityIcons
                      name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.typography.caption}
                    />
                  </ThemedView>

                  {expandedIndex === index && (
                    <ThemedView style={{
                      padding: 16,
                      paddingTop: 0,
                      backgroundColor: 'transparent'
                    }}>
                      <ThemedText style={{
                        fontSize: 14,
                        color: theme.typography.body,
                        lineHeight: 20
                      }}>
                        {faq.answer}
                      </ThemedText>
                    </ThemedView>
                  )}
                </TouchableOpacity>
              </MotiView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Contact Section */}
        <ThemedView style={{ padding: 16 }}>
          <ThemedText style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
            color: theme.typography.heading
          }}>
            Nous contacter
          </ThemedText>

          <ThemedView style={{ gap: 8 }}>
            {contactMethods.map((method, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 80 + 400 }}
              >
                <TouchableOpacity
                  onPress={method.action}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1,
                    borderColor: theme.outline + '20'
                  }}
                >
                  <ThemedView style={{
                    backgroundColor: method.color + '20',
                    borderRadius: 10,
                    padding: 10
                  }}>
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={24}
                      color={method.color}
                    />
                  </ThemedView>

                  <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <ThemedText style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: theme.typography.body,
                      marginBottom: 2
                    }}>
                      {method.label}
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 13,
                      color: theme.typography.caption
                    }}>
                      {method.value}
                    </ThemedText>
                  </ThemedView>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.typography.caption}
                  />
                </TouchableOpacity>
              </MotiView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* App Info */}
        <ThemedView style={{ padding: 16, paddingBottom: 32 }}>
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center'
          }}>
            <MaterialCommunityIcons name="information" size={32} color={theme.primary} />
            <ThemedText style={{
              fontSize: 14,
              color: theme.typography.caption,
              marginTop: 8,
              textAlign: 'center'
            }}>
              EasyRent v1.0.0
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: theme.typography.caption,
              marginTop: 4,
              textAlign: 'center'
            }}>
              © 2024 EasyRent. Tous droits réservés.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;
