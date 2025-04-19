
  // Rendu de la section d'envoi de paiement
  const renderSendPayment = () => (
    <ScrollView className="w-full h-full">
      <ThemedView variant="surface" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Envoyer un paiement</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Montant</Text>
          <TextInput
            placeholder="0.00"
            keyboardType="numeric"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurfaceVariant}
          />
          
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Description</Text>
          <TextInput
            placeholder="Description du paiement"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurfaceVariant}
          />
          
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Destinataire</Text>
          <TextInput
            placeholder="Email ou identifiant"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurfaceVariant}
          />
          
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Méthode de paiement</Text>
          <View style={styles.paymentMethodsContainer}>
            {walletData.paymentMethods.map((method, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.paymentMethodOption,
                  { borderColor: theme.outline }
                ]}
              >
                <View style={styles.paymentMethodOptionInfo}>
                  {method.type === 'card' ? (
                    <CreditCard size={20} color={theme.primary} />
                  ) : (
                    <DollarSign size={20} color={theme.secondary} />
                  )}
                  <View>
                    <Text style={[styles.paymentMethodName, { color: theme.onSurface }]}>{method.name}</Text>
                    <Text style={[styles.paymentMethodNumber, { color: theme.onSurfaceVariant }]}>
                      {method.type === 'card' ? `•••• ${method.last4}` : `•••• ${method.last4}`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.radioButton, { borderColor: theme.primary }]}>
                  <View style={[styles.radioButtonInner, { backgroundColor: theme.primary }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => handleNewPayment(250, 'Test paiement', walletData.paymentMethods[0].id)}
          >
            <Text style={styles.primaryButtonText}>Confirmer le paiement</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
  