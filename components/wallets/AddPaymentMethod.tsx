import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  Calendar,
  Lock,
  User,
  Phone,
  Mail
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddPaymentMethodProps {
  onBack: () => void;
  onAdd: (method: any) => Promise<void>;
  type: 'mobile_money' | 'card' | 'bank' | 'paypal';
}

export const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({
  onBack,
  onAdd,
  type
}) => {
  const { theme } = useTheme();

  // États pour les différents types
  const [loading, setLoading] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Mobile Money fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [accountName, setAccountName] = useState('');

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');

  // PayPal fields
  const [email, setEmail] = useState('');

  const providers = [
    { id: 'orange', name: 'Orange Money', color: '#FF7900' },
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCB05' },
    { id: 'moov', name: 'Moov Money', color: '#009EE2' },
    { id: 'wave', name: 'Wave', color: '#6C5CE7' }
  ];

  const handleAdd = async () => {
    try {
      setLoading(true);

      let methodData: any = {
        type,
        isDefault: false
      };

      switch (type) {
        case 'card':
          if (!cardNumber || !cardName || !expiryDate || !cvv) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
          }
          methodData = {
            ...methodData,
            name: `${cardName} - ${cardNumber.slice(-4)}`,
            details: {
              last4: cardNumber.slice(-4),
              expiry: expiryDate,
              brand: 'Visa' // Détection automatique à implémenter
            }
          };
          break;

        case 'mobile_money':
          if (!phoneNumber || !provider || !accountName) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
          }
          methodData = {
            ...methodData,
            name: `${providers.find(p => p.id === provider)?.name} - ${phoneNumber}`,
            details: {
              phoneNumber,
              provider,
              accountName
            }
          };
          break;

        case 'bank':
          if (!bankName || !iban) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
          }
          methodData = {
            ...methodData,
            name: `${bankName} - ${iban.slice(-4)}`,
            details: {
              iban,
              swift,
              bankName
            }
          };
          break;

        case 'paypal':
          if (!email) {
            Alert.alert('Erreur', 'Veuillez entrer votre email PayPal');
            return;
          }
          methodData = {
            ...methodData,
            name: `PayPal - ${email}`,
            details: {
              email
            }
          };
          break;
      }

      await onAdd(methodData);
      Alert.alert('Succès', 'Méthode de paiement ajoutée', [{ text: 'OK', onPress: onBack }]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la méthode');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'card': return CreditCard;
      case 'mobile_money': return Smartphone;
      case 'bank': return Building2;
      case 'paypal': return Wallet;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'card': return 'Ajouter une carte';
      case 'mobile_money': return 'Ajouter Mobile Money';
      case 'bank': return 'Ajouter un compte bancaire';
      case 'paypal': return 'Ajouter PayPal';
    }
  };

  const Icon = getIcon();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{getTitle()}</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Icon Display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
            <Icon size={48} color={theme.primary} />
          </View>
        </MotiView>

        {/* Card Form */}
        {type === 'card' && (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>
                <CreditCard size={16} color={theme.onSurface} /> Numéro de carte
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={19}
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>
                <User size={16} color={theme.onSurface} /> Nom sur la carte
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="JEAN DUPONT"
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            <View style={styles.row}>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200 }}
                style={[styles.inputSection, { flex: 1, marginRight: 8 }]}
              >
                <ThemedText style={styles.inputLabel}>
                  <Calendar size={16} color={theme.onSurface} /> Expiration
                </ThemedText>
                <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                  <TextInput
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="MM/AA"
                    keyboardType="numeric"
                    maxLength={5}
                    style={[styles.input, { color: theme.onSurface }]}
                    placeholderTextColor={theme.onSurface + '40'}
                  />
                </View>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 250 }}
                style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}
              >
                <ThemedText style={styles.inputLabel}>
                  <Lock size={16} color={theme.onSurface} /> CVV
                </ThemedText>
                <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    style={[styles.input, { color: theme.onSurface }]}
                    placeholderTextColor={theme.onSurface + '40'}
                  />
                </View>
              </MotiView>
            </View>
          </>
        )}

        {/* Mobile Money Form */}
        {type === 'mobile_money' && (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>Opérateur</ThemedText>
              <View style={styles.providersGrid}>
                {providers.map((prov) => (
                  <TouchableOpacity
                    key={prov.id}
                    onPress={() => setProvider(prov.id)}
                    style={[
                      styles.providerCard,
                      {
                        borderColor: provider === prov.id ? prov.color : theme.outline + '30',
                        backgroundColor: provider === prov.id ? prov.color + '10' : 'transparent'
                      }
                    ]}
                  >
                    <View style={[styles.providerIcon, { backgroundColor: prov.color + '20' }]}>
                      <Smartphone size={24} color={prov.color} />
                    </View>
                    <ThemedText style={styles.providerName}>{prov.name}</ThemedText>
                    {provider === prov.id && (
                      <View style={styles.checkMark}>
                        <CheckCircle2 size={20} color={prov.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>
                <Phone size={16} color={theme.onSurface} /> Numéro de téléphone
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+225 XX XX XX XX XX"
                  keyboardType="phone-pad"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>
                <User size={16} color={theme.onSurface} /> Nom du compte
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Jean Dupont"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>
          </>
        )}

        {/* Bank Form */}
        {type === 'bank' && (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>
                <Building2 size={16} color={theme.onSurface} /> Nom de la banque
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Ex: BNP Paribas"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>IBAN</ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={iban}
                  onChangeText={setIban}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              style={styles.inputSection}
            >
              <ThemedText style={styles.inputLabel}>SWIFT/BIC (optionnel)</ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={swift}
                  onChangeText={setSwift}
                  placeholder="BNPAFRPP"
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>
          </>
        )}

        {/* PayPal Form */}
        {type === 'paypal' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.inputSection}
          >
            <ThemedText style={styles.inputLabel}>
              <Mail size={16} color={theme.onSurface} /> Email PayPal
            </ThemedText>
            <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.onSurface }]}
                placeholderTextColor={theme.onSurface + '40'}
              />
            </View>
          </MotiView>
        )}

        {/* Add Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handleAdd}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={loading ? [theme.outline + '40', theme.outline + '40'] : [theme.primary, theme.primary + 'DD']}
              style={styles.addButton}
            >
              <ThemedText style={styles.addButtonText}>
                {loading ? 'Ajout en cours...' : 'Ajouter la méthode'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  providerCard: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  providerIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  addButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
