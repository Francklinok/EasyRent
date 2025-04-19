import { ScrollView, TouchableOpacity,Text,View,StyleSheet, TextInput } from "react-native";

const RenderReceivePayment:React.FC<Props> = () => (
  <ScrollView className="w-full h-full">
    <ThemedView variant="surface" style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
          <ArrowLeft size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Recevoir un paiement</Text>
      </View>
      
      <View style={styles.receiveContainer}>
        <View style={[styles.qrCodeContainer, { borderColor: theme.outline }]}>
          <View style={styles.qrCodePlaceholder}>
            {/* Ici serait le QR code généré avec l'adresse de réception */}
            <View style={[styles.qrCode, { borderColor: theme.outline }]} />
          </View>
        </View>
        
        <Text style={[styles.receiveInfoText, { color: theme.onSurfaceVariant }]}>
          Partagez ce QR code ou votre identifiant pour recevoir un paiement
        </Text>
        
        <View style={[styles.receiveIdContainer, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
          <Text style={[styles.receiveId, { color: theme.onSurface }]}>wallet-immo-42586</Text>
          <TouchableOpacity 
            style={[styles.copyButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              // Logique pour copier dans le presse-papier
              Alert.alert('Copié', 'Identifiant copié dans le presse-papier');
            }}
          >
            <Copy size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Méthode de réception</Text>
        <View style={styles.receiveMethodsContainer}>
          <TouchableOpacity 
            style={[styles.receiveMethodOption, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]}
          >
            <DollarSign size={20} color={theme.primary} />
            <Text style={[styles.receiveMethodText, { color: theme.onSurface }]}>Monnaie fiduciaire</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.receiveMethodOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}
          >
            <Bitcoin size={20} color={theme.accent} />
            <Text style={[styles.receiveMethodText, { color: theme.onSurface }]}>Crypto-monnaie</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.receiveFormContainer}>
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Montant à demander (optionnel)</Text>
          <TextInput
            placeholder="0.00"
            keyboardType="numeric"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurfaceVariant}
          />
          
          <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Description (optionnel)</Text>
          <TextInput
            placeholder="Description du paiement demandé"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurfaceVariant}
          />
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              // Générer un lien de demande de paiement
              Alert.alert('Demande générée', 'Votre demande de paiement a été générée avec succès.');
            }}
          >
            <Text style={styles.primaryButtonText}>Générer une demande de paiement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  </ScrollView>
);
export default RenderReceivePayment;