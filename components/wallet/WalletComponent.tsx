// import React, { useState } from 'react';
// import { TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MotiView } from 'moti';
// import { ThemedView } from '@/components/ui/ThemedView';
// import { ThemedText } from '@/components/ui/ThemedText';
// import { useTheme } from '@/hooks/themehook';
// import { useWallet, useTransactions } from '@/hooks/useWallet';

// export const WalletComponent: React.FC = () => {
//   const { theme } = useTheme();
//   const [amount, setAmount] = useState('');
//   const [cryptoEnabled, setCryptoEnabled] = useState(false);
//   const [cryptoBalance, setCryptoBalance] = useState({
//     BTC: 0.00123456,
//     ETH: 0.0456789,
//     USDT: 1250.50
//   });

//   // Hooks pour récupérer les données du wallet depuis le backend
//   const { wallet, loading: walletLoading, error: walletError, refresh } = useWallet();
//   const {
//     transactions,
//     loading: transactionsLoading,
//     createTransaction,
//     transferMoney
//   } = useTransactions({}, 10);

//   const formatCurrency = (value: number): string => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(value);
//   };

//   const validateAmount = (value: string): { isValid: boolean; value: number } => {
//     const numValue = parseFloat(value);
//     if (isNaN(numValue) || numValue <= 0) {
//       Alert.alert('Erreur', 'Veuillez entrer un montant valide');
//       return { isValid: false, value: 0 };
//     }
//     return { isValid: true, value: numValue };
//   };

//   const handleAddFunds = async () => {
//     const { isValid, value } = validateAmount(amount);
//     if (!isValid) return;

//     const transaction = await createTransaction({
//       type: 'deposit',
//       amount: value,
//       description: 'Ajout de fonds au portefeuille',
//       currency: 'EUR'
//     });

//     if (transaction) {
//       Alert.alert('Succès', `${formatCurrency(value)} ont été ajoutés à votre portefeuille`);
//       setAmount('');
//       await refresh(); // Rafraîchir le wallet
//     }
//   };

//   const handleWithdraw = async () => {
//     const { isValid, value } = validateAmount(amount);
//     if (!isValid) return;

//     if (wallet && value > wallet.balance) {
//       Alert.alert('Erreur', 'Solde insuffisant');
//       return;
//     }

//     const transaction = await createTransaction({
//       type: 'withdrawal',
//       amount: value,
//       description: 'Retrait de fonds du portefeuille',
//       currency: 'EUR'
//     });

//     if (transaction) {
//       Alert.alert('Succès', `${formatCurrency(value)} ont été retirés de votre portefeuille`);
//       setAmount('');
//       await refresh(); // Rafraîchir le wallet
//     }
//   };

//   // Gestion des états de chargement et d'erreur
//   if (walletLoading && !wallet) {
//     return (
//       <ThemedView style={{ padding: 20, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
//         <ActivityIndicator size="large" color={theme.primary} />
//         <ThemedText style={{ marginTop: 16, fontSize: 16 }}>
//           Chargement du portefeuille...
//         </ThemedText>
//       </ThemedView>
//     );
//   }

//   if (walletError) {
//     return (
//       <ThemedView style={{ padding: 20, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
//         <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.error} />
//         <ThemedText style={{ marginTop: 16, fontSize: 16, color: theme.error, textAlign: 'center' }}>
//           Erreur lors du chargement du portefeuille
//         </ThemedText>
//         <ThemedText style={{ marginTop: 8, fontSize: 14, color: theme.onSurface + '80', textAlign: 'center' }}>
//           {walletError}
//         </ThemedText>
//         <TouchableOpacity
//           onPress={refresh}
//           style={{
//             marginTop: 20,
//             backgroundColor: theme.primary,
//             paddingHorizontal: 20,
//             paddingVertical: 10,
//             borderRadius: 8
//           }}
//         >
//           <ThemedText style={{ color: 'white', fontWeight: '600' }}>
//             Réessayer
//           </ThemedText>
//         </TouchableOpacity>
//       </ThemedView>
//     );
//   }

//   return (
//     <ScrollView
//       style={{ flex: 1 }}
//       showsVerticalScrollIndicator={false}
//       refreshControl={
//         <RefreshControl
//           refreshing={walletLoading}
//           onRefresh={refresh}
//           tintColor={theme.primary}
//         />
//       }
//     >
//       <ThemedView style={{ padding: 20, gap: 20 }}>
//         {/* Crypto Toggle Button */}
//         <MotiView
//           from={{ opacity: 0, translateY: -20 }}
//           animate={{ opacity: 1, translateY: 0 }}
//           transition={{ type: 'spring' }}
//         >
//           <TouchableOpacity
//             onPress={() => setCryptoEnabled(!cryptoEnabled)}
//             style={{
//               backgroundColor: theme.surfaceVariant,
//               borderRadius: 16,
//               padding: 16,
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               borderWidth: 2,
//               borderColor: cryptoEnabled ? theme.success : theme.outline + '30',
//             }}
//           >
//             <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
//               <LinearGradient
//                 colors={cryptoEnabled ? [theme.success, theme.success + '80'] : [theme.outline + '40', theme.outline + '20']}
//                 style={{ borderRadius: 12, padding: 10 }}
//               >
//                 <MaterialCommunityIcons
//                   name="bitcoin"
//                   size={24}
//                   color={cryptoEnabled ? 'white' : theme.onSurface + '60'}
//                 />
//               </LinearGradient>
//               <ThemedView style={{ backgroundColor: 'transparent' }}>
//                 <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>
//                   Portefeuille Crypto
//                 </ThemedText>
//                 <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
//                   {cryptoEnabled ? 'Activé' : 'Désactivé'}
//                 </ThemedText>
//               </ThemedView>
//             </ThemedView>
//             <MaterialCommunityIcons
//               name={cryptoEnabled ? 'toggle-switch' : 'toggle-switch-off'}
//               size={48}
//               color={cryptoEnabled ? theme.success : theme.outline + '60'}
//             />
//           </TouchableOpacity>
//         </MotiView>

//         {/* Main Wallet Card */}
//         <MotiView
//           from={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ type: 'spring' }}
//         >
//           <LinearGradient
//             colors={[theme.primary, theme.secondary || theme.primary + '80']}
//             style={{
//               borderRadius: 20,
//               padding: 24,
//               shadowColor: theme.primary,
//               shadowOffset: { width: 0, height: 8 },
//               shadowOpacity: 0.3,
//               shadowRadius: 16,
//               elevation: 8,
//             }}
//           >
//             <ThemedView style={{ backgroundColor: 'transparent', gap: 12 }}>
//               <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
//                   Mon Portefeuille FIAT
//                 </ThemedText>
//                 <MaterialCommunityIcons name="wallet" size={24} color="white" />
//               </ThemedView>

//               <ThemedText style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>
//                 {wallet ? formatCurrency(wallet.balance) : formatCurrency(0)}
//               </ThemedText>

//               <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between' }}>
//                 <ThemedText style={{ color: 'white', opacity: 0.8, fontSize: 14 }}>
//                   Solde disponible
//                 </ThemedText>
//                 {wallet?.pendingBalance && wallet.pendingBalance > 0 && (
//                   <ThemedText style={{ color: 'white', opacity: 0.8, fontSize: 14 }}>
//                     En attente: {formatCurrency(wallet.pendingBalance)}
//                   </ThemedText>
//                 )}
//               </ThemedView>
//             </ThemedView>
//           </LinearGradient>
//         </MotiView>

//         {/* Crypto Wallet Section */}
//         {cryptoEnabled && (
//           <MotiView
//             from={{ opacity: 0, translateY: 20 }}
//             animate={{ opacity: 1, translateY: 0 }}
//             transition={{ type: 'spring', delay: 200 }}
//           >
//             <ThemedView style={{ gap: 12 }}>
//               <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
//                 Cryptomonnaies
//               </ThemedText>

//               {/* Bitcoin */}
//               <LinearGradient
//                 colors={['#F7931A20', '#F7931A10']}
//                 style={{ borderRadius: 16, padding: 16 }}
//               >
//                 <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
//                   <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
//                     <LinearGradient
//                       colors={['#F7931A', '#F7931A80']}
//                       style={{ borderRadius: 12, padding: 10 }}
//                     >
//                       <MaterialCommunityIcons name="bitcoin" size={24} color="white" />
//                     </LinearGradient>
//                     <ThemedView style={{ backgroundColor: 'transparent' }}>
//                       <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>Bitcoin</ThemedText>
//                       <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>BTC</ThemedText>
//                     </ThemedView>
//                   </ThemedView>
//                   <ThemedView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
//                     <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>
//                       {cryptoBalance.BTC.toFixed(8)}
//                     </ThemedText>
//                     <ThemedText style={{ fontSize: 12, color: theme.success }}>
//                       ≈ {formatCurrency(cryptoBalance.BTC * 45000)}
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//               </LinearGradient>

//               {/* Ethereum */}
//               <LinearGradient
//                 colors={['#627EEA20', '#627EEA10']}
//                 style={{ borderRadius: 16, padding: 16 }}
//               >
//                 <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
//                   <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
//                     <LinearGradient
//                       colors={['#627EEA', '#627EEA80']}
//                       style={{ borderRadius: 12, padding: 10 }}
//                     >
//                       <MaterialCommunityIcons name="ethereum" size={24} color="white" />
//                     </LinearGradient>
//                     <ThemedView style={{ backgroundColor: 'transparent' }}>
//                       <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>Ethereum</ThemedText>
//                       <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>ETH</ThemedText>
//                     </ThemedView>
//                   </ThemedView>
//                   <ThemedView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
//                     <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>
//                       {cryptoBalance.ETH.toFixed(8)}
//                     </ThemedText>
//                     <ThemedText style={{ fontSize: 12, color: theme.success }}>
//                       ≈ {formatCurrency(cryptoBalance.ETH * 3000)}
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//               </LinearGradient>

//               {/* USDT */}
//               <LinearGradient
//                 colors={['#26A17B20', '#26A17B10']}
//                 style={{ borderRadius: 16, padding: 16 }}
//               >
//                 <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
//                   <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
//                     <LinearGradient
//                       colors={['#26A17B', '#26A17B80']}
//                       style={{ borderRadius: 12, padding: 10 }}
//                     >
//                       <MaterialCommunityIcons name="currency-usd" size={24} color="white" />
//                     </LinearGradient>
//                     <ThemedView style={{ backgroundColor: 'transparent' }}>
//                       <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>Tether</ThemedText>
//                       <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>USDT</ThemedText>
//                     </ThemedView>
//                   </ThemedView>
//                   <ThemedView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
//                     <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>
//                       {cryptoBalance.USDT.toFixed(2)}
//                     </ThemedText>
//                     <ThemedText style={{ fontSize: 12, color: theme.success }}>
//                       ≈ {formatCurrency(cryptoBalance.USDT * 0.92)}
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//               </LinearGradient>

//               {/* Total Crypto Value */}
//               <ThemedView style={{
//                 backgroundColor: theme.success + '20',
//                 borderRadius: 12,
//                 padding: 16,
//                 borderWidth: 1,
//                 borderColor: theme.success + '40',
//                 marginTop: 8
//               }}>
//                 <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <ThemedText style={{ fontSize: 14, color: theme.success, fontWeight: '600' }}>
//                     Valeur Totale Crypto
//                   </ThemedText>
//                   <ThemedText style={{ fontSize: 20, fontWeight: '800', color: theme.success }}>
//                     {formatCurrency((cryptoBalance.BTC * 45000) + (cryptoBalance.ETH * 3000) + (cryptoBalance.USDT * 0.92))}
//                   </ThemedText>
//                 </ThemedView>
//               </ThemedView>
//             </ThemedView>
//           </MotiView>
//         )}

//       <MotiView
//         from={{ opacity: 0, translateY: 20 }}
//         animate={{ opacity: 1, translateY: 0 }}
//         transition={{ delay: 200, type: 'spring' }}
//       >
//         <ThemedView style={{
//           backgroundColor: theme.surface,
//           borderRadius: 16,
//           padding: 16,
//           borderWidth: 1,
//           borderColor: theme.outline + '30'
//         }}>
//           <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
//             Montant
//           </ThemedText>
//           <TextInput
//             value={amount}
//             onChangeText={setAmount}
//             placeholder="0.00"
//             keyboardType="numeric"
//             style={{
//               fontSize: 18,
//               fontWeight: '600',
//               color: theme.typography.body,
//               backgroundColor: theme.surfaceVariant + '30',
//               borderRadius: 12,
//               padding: 16,
//               textAlign: 'center'
//             }}
//           />
//         </ThemedView>
//       </MotiView>

//       <MotiView
//         from={{ opacity: 0, translateY: 20 }}
//         animate={{ opacity: 1, translateY: 0 }}
//         transition={{ delay: 400, type: 'spring' }}
//         style={{ flexDirection: 'row', gap: 12 }}
//       >
//         <TouchableOpacity
//           onPress={handleAddFunds}
//           disabled={transactionsLoading}
//           style={{ flex: 1 }}
//         >
//           <LinearGradient
//             colors={[theme.success, theme.success + '80']}
//             style={{
//               borderRadius: 16,
//               padding: 16,
//               alignItems: 'center',
//               opacity: transactionsLoading ? 0.7 : 1
//             }}
//           >
//             {transactionsLoading ? (
//               <ActivityIndicator size={24} color="white" />
//             ) : (
//               <MaterialCommunityIcons name="plus" size={24} color="white" />
//             )}
//             <ThemedText style={{ color: 'white', fontWeight: '700', marginTop: 8 }}>
//               Ajouter
//             </ThemedText>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={handleWithdraw}
//           disabled={transactionsLoading}
//           style={{ flex: 1 }}
//         >
//           <LinearGradient
//             colors={[theme.error, theme.error + '80']}
//             style={{
//               borderRadius: 16,
//               padding: 16,
//               alignItems: 'center',
//               opacity: transactionsLoading ? 0.7 : 1
//             }}
//           >
//             {transactionsLoading ? (
//               <ActivityIndicator size={24} color="white" />
//             ) : (
//               <MaterialCommunityIcons name="minus" size={24} color="white" />
//             )}
//             <ThemedText style={{ color: 'white', fontWeight: '700', marginTop: 8 }}>
//               Retirer
//             </ThemedText>
//           </LinearGradient>
//         </TouchableOpacity>
//       </MotiView>

//       <MotiView
//         from={{ opacity: 0, translateY: 20 }}
//         animate={{ opacity: 1, translateY: 0 }}
//         transition={{ delay: 600, type: 'spring' }}
//       >
//         <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
//           Transactions récentes
//         </ThemedText>
        
//         {transactions.slice(0, 5).map((transaction, index) => (
//           <ThemedView
//             key={transaction.id}
//             style={{
//               backgroundColor: theme.surface,
//               borderRadius: 12,
//               padding: 16,
//               marginBottom: 8,
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between'
//             }}
//           >
//             <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//               <ThemedView style={{
//                 backgroundColor: getTransactionColor(transaction.type) + '20',
//                 borderRadius: 8,
//                 padding: 8
//               }}>
//                 <MaterialCommunityIcons
//                   name={getTransactionIcon(transaction.type)}
//                   size={16}
//                   color={getTransactionColor(transaction.type)}
//                 />
//               </ThemedView>
//               <ThemedView>
//                 <ThemedText style={{ fontWeight: '600' }}>
//                   {transaction.description}
//                 </ThemedText>
//                 <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                   <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
//                     {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
//                   </ThemedText>
//                   <ThemedView style={{
//                     backgroundColor: getStatusColor(transaction.status) + '20',
//                     paddingHorizontal: 6,
//                     paddingVertical: 2,
//                     borderRadius: 8
//                   }}>
//                     <ThemedText style={{
//                       fontSize: 10,
//                       color: getStatusColor(transaction.status),
//                       fontWeight: '600'
//                     }}>
//                       {transaction.status}
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//               </ThemedView>
//             </ThemedView>

//             <ThemedText style={{
//               fontWeight: '700',
//               color: getTransactionColor(transaction.type)
//             }}>
//               {getTransactionSign(transaction.type)}{formatCurrency(transaction.amount)}
//             </ThemedText>
//           </ThemedView>
//         ))}

//         {transactions.length === 0 && !transactionsLoading && (
//           <ThemedView style={{
//             backgroundColor: theme.surface,
//             borderRadius: 12,
//             padding: 24,
//             alignItems: 'center'
//           }}>
//             <MaterialCommunityIcons
//               name="history"
//               size={48}
//               color={theme.onSurface + '40'}
//             />
//             <ThemedText style={{
//               fontSize: 16,
//               fontWeight: '600',
//               marginTop: 12,
//               color: theme.onSurface + '60'
//             }}>
//               Aucune transaction
//             </ThemedText>
//             <ThemedText style={{
//               fontSize: 14,
//               marginTop: 4,
//               color: theme.onSurface + '40',
//               textAlign: 'center'
//             }}>
//               Vos transactions apparaîtront ici
//             </ThemedText>
//           </ThemedView>
//         )}

//         {transactionsLoading && (
//           <ThemedView style={{
//             backgroundColor: theme.surface,
//             borderRadius: 12,
//             padding: 24,
//             alignItems: 'center'
//           }}>
//             <ActivityIndicator size="small" color={theme.primary} />
//             <ThemedText style={{
//               fontSize: 14,
//               marginTop: 12,
//               color: theme.onSurface + '60'
//             }}>
//               Chargement des transactions...
//             </ThemedText>
//           </ThemedView>
//         )}
//       </MotiView>
//       </ThemedView>
//     </ScrollView>
//   );

//   // Fonctions utilitaires pour les transactions
//   function getTransactionIcon(type: string): string {
//     switch (type) {
//       case 'deposit':
//         return 'plus';
//       case 'withdrawal':
//         return 'minus';
//       case 'payment':
//         return 'send';
//       case 'received':
//         return 'download';
//       case 'crypto':
//         return 'currency-btc';
//       default:
//         return 'swap-horizontal';
//     }
//   }

//   function getTransactionColor(type: string): string {
//     switch (type) {
//       case 'deposit':
//       case 'received':
//         return theme.success;
//       case 'withdrawal':
//       case 'payment':
//         return theme.error;
//       case 'crypto':
//         return theme.warning;
//       default:
//         return theme.primary;
//     }
//   }

//   function getTransactionSign(type: string): string {
//     switch (type) {
//       case 'deposit':
//       case 'received':
//         return '+';
//       case 'withdrawal':
//       case 'payment':
//         return '-';
//       default:
//         return '';
//     }
//   }

//   function getStatusColor(status: string): string {
//     switch (status) {
//       case 'completed':
//         return theme.success;
//       case 'pending':
//         return theme.warning;
//       case 'failed':
//       case 'cancelled':
//         return theme.error;
//       default:
//         return theme.onSurface;
//     }
//   }
// };