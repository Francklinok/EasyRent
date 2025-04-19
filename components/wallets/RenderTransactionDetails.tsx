

const renderTransactionDetail = (transactionId) => {
  const transaction = transactionHistory.find(t => t.id === parseInt(transactionId));
  
  if (!transaction) return <View><Text>Transaction non trouvée</Text></View>;
  
  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant="surface" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('transactions')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Détails de la transaction</Text>
        </View>
        
        <ThemedView variant="surfaceVariant" style={styles.transactionDetailCard} bordered>
          <View style={styles.transactionDetailHeader}>
            <View style={[styles.transactionIconXLarge, { 
              backgroundColor: transaction.type === 'received' ? theme.accent : 
                               transaction.type === 'crypto' ? '#f7931a' : theme.secondary 
            }]}>
              {transaction.type === 'received' ? (
                <Download size={24} color="#fff" />
              ) : transaction.type === 'crypto' ? (
                <Bitcoin size={24} color="#fff" />
              ) : (
                <Send size={24} color="#fff" />
              )}
            </View>
            
            <View style={styles.transactionDetailHeaderInfo}>
              <Text style={[styles.transactionDetailType, { color: theme.onSurface }]}>
                {transaction.type === 'received' ? 'Paiement reçu' : 
                 transaction.type === 'crypto' ? 'Transaction crypto' : 'Paiement envoyé'}
              </Text>
              <Text style={[styles.transactionDetailDate, { color: theme.onSurfaceVariant }]}>
                {transaction.date}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionDetailAmount}>
            <Text style={[styles.transactionDetailAmountValue, { 
              color: transaction.type === 'received' ? '#4caf50' : 
                     transaction.type === 'crypto' ? '#f7931a' : theme.onSurface 
            }]}>
              {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
              {transaction.type === 'crypto' 
                ? `${transaction.amount} ${transaction.cryptoCurrency}`
                : formatAmount(transaction.amount)
              }
            </Text>
            
            {transaction.type === 'crypto' && (
              <Text style={[styles.transactionDetailEquivalent, { color: theme.onSurfaceVariant }]}>
                ≈ {formatAmount(transaction.amount * 58365.25)} {/* Taux fictif pour l'exemple */}
              </Text>
            )}
          </View>
          
          <View style={styles.transactionDetailInfo}>
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Statut</Text>
              <View style={[styles.transactionDetailStatusBadge, { 
                backgroundColor: transaction.status === 'completed' ? '#e6f7ed' : theme.surfaceVariant 
              }]}>
                <Text style={[styles.transactionDetailStatusText, { 
                  color: transaction.status === 'completed' ? '#4caf50' : theme.onSurfaceVariant 
                }]}>
                  {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                </Text>
              </View>
            </View>
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Description</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>{transaction.description}</Text>
            </View>
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>ID de transaction</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>TX-{Math.random().toString(36).substring(2, 10)}</Text>
            </View>
            
            {transaction.type === 'crypto' && (
              <View style={styles.transactionDetailRow}>
                <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Adresse de blockchain</Text>
                <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>
                  {transaction.type === 'crypto' ? '0x3F5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE' : 'N/A'}
                </Text>
              </View>
            )}
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Frais</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>
                {transaction.type === 'crypto' ? '0.0005 BTC' : formatAmount(2.50)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.outline }]}
            onPress={() => {
              // Logique pour exporter le reçu
              Alert.alert('Reçu exporté', 'Le reçu de la transaction a été sauvegardé dans vos documents.');
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Exporter le reçu</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};
