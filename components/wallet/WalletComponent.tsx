import React, { useState } from 'react';
import { TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useUser } from '@/components/contexts/user/UserContext';
import { formatCurrency, validateAmount, showPaymentSuccess, showInsufficientFunds } from '@/components/utils/walletUtils';

export const WalletComponent: React.FC = () => {
  const { theme } = useTheme();
  const { wallet, addFunds, withdrawFunds } = useUser();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFunds = async () => {
    const { isValid, value } = validateAmount(amount);
    if (!isValid) return;

    setIsLoading(true);
    const success = await addFunds(value);
    setIsLoading(false);

    if (success) {
      showPaymentSuccess(value, 'Ajout de fonds');
      setAmount('');
    } else {
      Alert.alert('Erreur', 'Impossible d\'ajouter les fonds');
    }
  };

  const handleWithdraw = async () => {
    const { isValid, value } = validateAmount(amount);
    if (!isValid) return;

    if (value > wallet.balance) {
      showInsufficientFunds();
      return;
    }

    setIsLoading(true);
    const success = await withdrawFunds(value);
    setIsLoading(false);

    if (success) {
      showPaymentSuccess(value, 'Retrait de fonds');
      setAmount('');
    } else {
      Alert.alert('Erreur', 'Impossible de retirer les fonds');
    }
  };

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
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <ThemedView style={{ backgroundColor: 'transparent', gap: 12 }}>
            <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Mon Portefeuille
              </ThemedText>
              <MaterialCommunityIcons name="wallet" size={24} color="white" />
            </ThemedView>
            
            <ThemedText style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>
              {formatCurrency(wallet.balance)}
            </ThemedText>
            
            <ThemedText style={{ color: 'white', opacity: 0.8, fontSize: 14 }}>
              {wallet.transactions.length} transactions
            </ThemedText>
          </ThemedView>
        </LinearGradient>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200, type: 'spring' }}
      >
        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.outline + '30'
        }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Montant
          </ThemedText>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.typography.body,
              backgroundColor: theme.surfaceVariant + '30',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center'
            }}
          />
        </ThemedView>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400, type: 'spring' }}
        style={{ flexDirection: 'row', gap: 12 }}
      >
        <TouchableOpacity
          onPress={handleAddFunds}
          disabled={isLoading}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.success, theme.success + '80']}
            style={{
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '700', marginTop: 8 }}>
              Ajouter
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWithdraw}
          disabled={isLoading}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.error, theme.error + '80']}
            style={{
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <MaterialCommunityIcons name="minus" size={24} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '700', marginTop: 8 }}>
              Retirer
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, type: 'spring' }}
      >
        <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
          Transactions récentes
        </ThemedText>
        
        {wallet.transactions.slice(0, 3).map((transaction) => (
          <ThemedView
            key={transaction.id}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ThemedView style={{
                backgroundColor: transaction.type === 'deposit' ? theme.success + '20' : theme.error + '20',
                borderRadius: 8,
                padding: 8
              }}>
                <MaterialCommunityIcons
                  name={transaction.type === 'deposit' ? 'plus' : 'minus'}
                  size={16}
                  color={transaction.type === 'deposit' ? theme.success : theme.error}
                />
              </ThemedView>
              <ThemedView>
                <ThemedText style={{ fontWeight: '600' }}>
                  {transaction.description}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedText style={{
              fontWeight: '700',
              color: transaction.type === 'deposit' ? theme.success : theme.error
            }}>
              {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </ThemedText>
          </ThemedView>
        ))}
      </MotiView>
    </ThemedView>
  );
};