
// Rendu des paramètres de sécurité
const renderSecuritySettings = () => (
  <ScrollView className="w-full h-full">
    <ThemedView variant="surface" style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
          <ArrowLeft size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Sécurité et authentification</Text>
      </View>
      
      <View style={styles.securityContainer}>
        <ThemedView variant="surfaceVariant" style={styles.securityItem} bordered>
          <View style={styles.securityItemHeader}>
            <Shield size={20} color={theme.primary} />
            <Text style={[styles.securityItemTitle, { color: theme.onSurface }]}>Authentification à deux facteurs</Text>
          </View>
          <Text style={[styles.securityItemDescription, { color: theme.onSurfaceVariant }]}>
            Renforcez la sécurité de votre compte en ajoutant une deuxième couche d'authentification.
          </Text>
          <View style={styles.securityToggleContainer}>
            <Text style={[styles.securityToggleLabel, { color: theme.onSurface }]}>Activer la 2FA</Text>
            <TouchableOpacity style={[styles.toggle, { backgroundColor: theme.primary }]}>
              <View style={styles.toggleKnob} />
            </TouchableOpacity>
          </View>
        </ThemedView>
        
        <ThemedView variant="surfaceVariant" style={styles.securityItem} bordered>
          <View style={styles.securityItemHeader}>
            <Fingerprint size={20} color={theme.accent} />
            <Text style={[styles.securityItemTitle, { color: theme.onSurface }]}>Authentification biométrique</Text>
          </View>
          <Text style={[styles.securityItemDescription, { color: theme.onSurfaceVariant }]}>
            Utilisez votre empreinte digitale ou reconnaissance faciale pour accéder rapidement à votre portefeuille.
          </Text>
          <View style={styles.securityToggleContainer}>
            <Text style={[styles.securityToggleLabel, { color: theme.onSurface }]}>Activer l'authentification biométrique</Text>
            <TouchableOpacity style={[styles.toggle, { backgroundColor: theme.primary }]}>
              <View style={styles.toggleKnob} />
            </TouchableOpacity>
          </View>
        </ThemedView>
        
        <ThemedView variant="surfaceVariant" style={styles.securityItem} bordered>
          <View style={styles.securityItemHeader}>
            <Key size={20} color={theme.secondary} />
            <Text style={[styles.securityItemTitle, { color: theme.onSurface }]}>Code PIN de sécurité</Text>
          </View>
          <Text style={[styles.securityItemDescription, { color: theme.onSurfaceVariant }]}>
            Définissez un code PIN pour sécuriser les transactions et l'accès à votre portefeuille.
          </Text>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.outline }]}
            onPress={() => {
              // Logique pour modifier le PIN
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Modifier le code PIN</Text>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView variant="surfaceVariant" style={styles.securityItem} bordered>
          <View style={styles.securityItemHeader}>
            <History size={20} color={theme.onSurfaceVariant} />
            <Text style={[styles.securityItemTitle, { color: theme.onSurface }]}>Historique des connexions</Text>
          </View>
          <Text style={[styles.securityItemDescription, { color: theme.onSurfaceVariant }]}>
            Consultez l'historique des accès à votre compte pour détecter toute activité suspecte.
          </Text>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.outline }]}
            onPress={() => {
              // Logique pour afficher l'historique
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Voir l'historique</Text>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView variant="surfaceVariant" style={styles.securityItem} bordered>
          <View style={styles.securityItemHeader}>
            <Wallet size={20} color={theme.accent} />
            <Text style={[styles.securityItemTitle, { color: theme.onSurface }]}>Clés de récupération</Text>
          </View>
          <Text style={[styles.securityItemDescription, { color: theme.onSurfaceVariant }]}>
            Sauvegardez les clés de récupération pour votre portefeuille crypto en lieu sûr.
          </Text>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.outline }]}
            onPress={() => {
              // Logique pour afficher les clés
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Afficher les clés</Text>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </ThemedView>
  </ScrollView>
);
