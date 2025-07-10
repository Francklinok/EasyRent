import { ScrollView, TouchableOpacity, Text, View, StyleSheet, TextInput, Alert } from "react-native";
import { ArrowLeft, DollarSign, Bitcoin, Copy } from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from "../ui/ThemedView";
import _ from 'lodash';
import { ThemedText } from "../ui/ThemedText";
import { BackButton } from "../ui/BackButton";

type Props = {
  setCurrentSection: (section: string) => void;
}

const RenderReceivePayment: React.FC<Props> = ({ setCurrentSection }) => {
  const {theme} = useTheme();
  
  return (
<ThemedView className="h-full">
    <ScrollView 
     showsVerticalScrollIndicator={false}
     contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}>
      <ThemedView style={styles.sectionContainer}>
        <ThemedView className="gap-4" style={styles.sectionHeader}>
          <BackButton/>
          <ThemedText  type = "subtitle" style={ { color: theme.onSurface }}>Recevoir un paiement</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.receiveContainer}>
          <ThemedView style={[styles.qrCodeContainer, { borderColor: theme.outline }]}>
            <ThemedView style={styles.qrCodePlaceholder}>
              {/* Ici serait le QR code généré avec l'adresse de réception */}
              {/* <ThemedView style={[styles.qrCode, { borderColor: theme.outline }]} /> */}
            </ThemedView>
          </ThemedView>
          
          <ThemedText className="px-10 py-4 " style={ { color: theme.onSurface}}>
            Partagez ce QR code ou votre identifiant pour recevoir un paiement
          </ThemedText>
          
          <ThemedView style={[styles.receiveIdContainer, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
            <ThemedText style={ { color: theme.onSurface }}>wallet-immo-42586</ThemedText>
            <TouchableOpacity 
              style={[styles.copyButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // Logique pour copier dans le presse-papier
                Alert.alert('Copié', 'Identifiant copié dans le presse-papier');
              }}
            >
              <Copy size={16} color= {theme.surface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedText className = "pb-2" style={ { color: theme.onSurface}}>Méthode de réception</ThemedText>
          <ThemedView style={styles.receiveMethodsContainer}>
            <TouchableOpacity 
              style={[styles.receiveMethodOption, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]}
            >
              <DollarSign size={20} color={theme.primary} />
              <ThemedText style={ { color: theme.onSurface }}>Monnaie fiduciaire</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.receiveMethodOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}
            >
              <Bitcoin size={20} color={theme.accent} />
              <ThemedText style={ { color: theme.onSurface }}>Crypto-monnaie</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.receiveFormContainer}>
            <ThemedText className="pb-2" style={{ color: theme.onSurface }}>Montant à demander (optionnel)</ThemedText>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface}
            />
            
            <ThemedText className = "py-2" style={ { color: theme.onSurface }}>Description (optionnel)</ThemedText>
            <TextInput
              placeholder="Description du paiement demandé"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface}
            />
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // Générer un lien de demande de paiement
                Alert.alert('Demande générée', 'Votre demande de paiement a été générée avec succès.');
              }}
            >
              <ThemedText style = {{color:theme.surface}}>Générer une demande de paiement</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
 
  receiveContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  qrCodeContainer: {
    padding: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  qrCodePlaceholder: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
  },
  receiveInfoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  receiveIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  receiveId: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  receiveMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  receiveMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    width: '48%',
    justifyContent: 'center',
  },
  receiveMethodText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  receiveFormContainer: {
    width: '100%',
  },
  formInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default RenderReceivePayment;