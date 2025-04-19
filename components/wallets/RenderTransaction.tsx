
const renderTransactions = () => (
  <ScrollView className="w-full h-full">
    <ThemedView variant="surface" style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
          <ArrowLeft size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Historique des transactions</Text>
      </View>
      
      <View style={styles.transactionFilterContainer}>
        <Text style={[styles.filterLabel, { color: theme.onSurfaceVariant }]}>Filtrer par</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity style={[styles.filterOption, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.filterOptionText, { color: theme.primary }]}>Tout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.filterOptionText, { color: theme.onSurfaceVariant }]}>Envoyés</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.filterOptionText, { color: theme.onSurfaceVariant }]}>Reçus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.filterOptionText, { color: theme.onSurfaceVariant }]}>Crypto</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.transactionsListContainer}>
        {transactionHistory.map((transaction, index) => (
          <TouchableOpacity 
            key={transaction.id}
            style={[styles.transactionItemLarge, index < transactionHistory.length - 1 ? { borderBottomColor: theme.outline, borderBottomWidth: 1 } : {}]}
            onPress={() => setCurrentSection(`transaction-detail-${transaction.id}`)}
          >
            <View style={styles.transactionInfoLarge}>
              <View style={[styles.transactionIconLarge, { 
                backgroundColor: transaction.type === 'received' ? theme.accent : 
                                 transaction.type === 'crypto' ? '#f7931a' : theme.secondary 
              }]}>
                {transaction.type === 'received' ? (
                  <Download size={18} color="#fff" />
                ) : transaction.type === 'crypto' ? (
                  <Bitcoin size={18} color="#fff" />
                ) : (
                  <Send size={18} color="#fff" />
                )}
              </View>
              <View style={styles.transactionDetailsLarge}>
                <Text style={[styles.transactionDescLarge, { color: theme.onSurface }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDateLarge, { color: theme.onSurfaceVariant }]}>
                  {transaction.date}
                </Text>
                {transaction.status === 'pending' && (
                  <View style={[styles.statusBadge, { backgroundColor: theme.surfaceVariant }]}>
                    <Text style={[styles.statusBadgeText, { color: theme.onSurfaceVariant }]}>En attente</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.transactionAmountContainerLarge}>
              <Text style={[styles.transactionAmountLarge, { 
                color: transaction.type === 'received' ? '#4caf50' : 
                       transaction.type === 'crypto' ? '#f7931a' : theme.onSurface 
              }]}>
                {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
                {transaction.type === 'crypto' 
                  ? `${transaction.amount} ${transaction.cryptoCurrency}`
                  : formatAmount(transaction.amount)
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  </ScrollView>
);