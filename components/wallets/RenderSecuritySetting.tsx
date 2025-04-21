import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { Shield, Wallet, ArrowLeft, History, Fingerprint, Key ,DollarSign} from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import _ from 'lodash';
import { ThemedText } from "../ui/ThemedText";
const currencies = ['EUR', 'USD', 'GBP', 'JPY'];

type Props = {
  setCurrentSection: (section: string) => void,
  selectedCurrency:string,
  setSelectedCurrency: React.Dispatch<React.SetStateAction<string>>;

}

// Rendu des paramètres de sécurité
const RenderSecuritySettings: React.FC<Props> = ({ setCurrentSection,selectedCurrency, setSelectedCurrency }) => {
  const {theme} = useTheme();
  
  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant="default" style={styles.sectionContainer}>
        <ThemedView style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Sécurité et authentification</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.securityContainer}>
          <ThemedView variant="surface" style={styles.securityItem} bordered>
            <ThemedView variant = "surface" style={styles.securityItemHeader}>
              <Shield size={20} color={theme.primary} />
              <ThemedText type = "title" style={[styles.securityItemTitle, { color: theme.onSurface }]}>Authentification à deux facteurs</ThemedText>
            </ThemedView>
            <ThemedText type = "body" style={[styles.securityItemDescription, { color: theme.onSurface }]}>
              Renforcez la sécurité de votre compte en ajoutant une deuxième couche d'authentification.
            </ThemedText>
            <ThemedView variant = "surface" style={styles.securityToggleContainer}>
              <ThemedText style={[styles.securityToggleLabel, { color: theme.onSurface }]}>Activer la 2FA</ThemedText>
              <TouchableOpacity style={[styles.toggle, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.toggleKnob} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
          
          <ThemedView variant="surface" style={styles.securityItem} bordered>
            <ThemedView variant = "surface" style={styles.securityItemHeader}>
              <Fingerprint size={20} color={theme.accent} />
              <ThemedText type = "title" style={[styles.securityItemTitle, { color: theme.onSurface }]}>Authentification biométrique</ThemedText>
            </ThemedView>
            <ThemedText type= "body"  style={[styles.securityItemDescription, { color: theme.onSurface}]}>
              Utilisez votre empreinte digitale ou reconnaissance faciale pour accéder rapidement à votre portefeuille.
            </ThemedText>
            <ThemedView variant = "surface" style={styles.securityToggleContainer}>
              <ThemedText style={[styles.securityToggleLabel, { color: theme.onSurface }]}>Activer l'authentification biométrique</ThemedText>
              <TouchableOpacity style={[styles.toggle, { backgroundColor: theme.primary }]}>
                <ThemedView style={styles.toggleKnob} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        
          <ThemedView variant="surface" style={styles.securityItem}>
            <ThemedView variant = "surface" style={styles.securityItemHeader}>
              <DollarSign size={20} color={theme.primary} />
              <ThemedText type = "title" style={[styles.securityItemTitle, { color: theme.onSurface }]}>Devise par défaut</ThemedText>
            </ThemedView>
            <ThemedText type = "body" style={[styles.securityItemDescription, { color: theme.onSurface }]}>
              Choisissez la devise principale pour afficher vos soldes et transactions.
            </ThemedText>
            <View style={styles.currencySelector}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyOption,
                    { 
                      backgroundColor: selectedCurrency === currency ? theme.primary : 'transparent',
                      borderColor: theme.outline
                    }
                  ]}
                  onPress={() => setSelectedCurrency(currency)}
                >
                  <Text style={{ 
                    color: selectedCurrency === currency ? '#fff' : theme.onSurface,
                    fontWeight: '500'
                  }}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
          
          <ThemedView variant="surface" style={styles.securityItem} bordered>
            <ThemedView variant="surface" style={styles.securityItemHeader}>
              <Key size={20} color={theme.secondary} />
              <ThemedText type = "title" style={[styles.securityItemTitle, { color: theme.onSurface }]}>Code PIN de sécurité</ThemedText>
            </ThemedView>
            <ThemedText type = "body"style={[styles.securityItemDescription, { color: theme.onSurface }]}>
              Définissez un code PIN pour sécuriser les transactions et l'accès à votre portefeuille.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.outline }]}
              onPress={() => {
                // Logique pour modifier le PIN
              }}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: theme.primary }]}>Modifier le code PIN</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView variant="surface" style={styles.securityItem} bordered>
            <ThemedView variant = "surface" style={styles.securityItemHeader}>
              <History size={20} color={theme.onSurfaceVariant} />
              <ThemedText type = "title"style={[styles.securityItemTitle, { color: theme.onSurface }]}>Historique des connexions</ThemedText>
            </ThemedView>
            <ThemedText type = "body" style={[styles.securityItemDescription, { color: theme.onSurface }]}>
              Consultez l'historique des accès à votre compte pour détecter toute activité suspecte.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.outline }]}
              onPress={() => {
                // Logique pour afficher l'historique
              }}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: theme.primary }]}>Voir l'historique</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView variant="surface" style={styles.securityItem} bordered>
            <ThemedView variant="surface"  style={styles.securityItemHeader}>
              <Wallet size={20} color={theme.accent} />
              <ThemedText type = "title" style={[styles.securityItemTitle, { color: theme.onSurface }]}>Clés de récupération</ThemedText>
            </ThemedView>
            <ThemedText type = "body" style={[styles.securityItemDescription, { color: theme.onSurface }]}>
              Sauvegardez les clés de récupération pour votre portefeuille crypto en lieu sûr.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.outline }]}
              onPress={() => {
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Afficher les clés</Text>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  securityContainer: {
    width: '100%',
    gap: 16,
  },
  securityItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  securityItemDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  securityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityToggleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-end',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  currencyOption: {
    width: '23%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default RenderSecuritySettings;