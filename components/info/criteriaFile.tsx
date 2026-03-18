import { ScrollView, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { OwnerCriteria, PropertyType } from "@/types/ItemType";
import React from "react";
import { isLandProperty, getPropertyDisplayConfig } from "@/components/utils/propertyDisplayConfig";

// Payment method labels and icons
const PAYMENT_METHODS: Record<string, { label: string; icon: string; iconLib: 'MaterialIcons' | 'FontAwesome5' | 'Ionicons' }> = {
  mobile_money: { label: 'Mobile Money', icon: 'phone-android', iconLib: 'MaterialIcons' },
  bank_card: { label: 'Carte bancaire', icon: 'credit-card', iconLib: 'MaterialIcons' },
  paypal: { label: 'PayPal', icon: 'paypal', iconLib: 'FontAwesome5' },
  bank_transfer: { label: 'Virement', icon: 'account-balance', iconLib: 'MaterialIcons' },
  cash: { label: 'Espèces', icon: 'payments', iconLib: 'MaterialIcons' },
  crypto: { label: 'Crypto', icon: 'currency-bitcoin', iconLib: 'MaterialIcons' },
  other: { label: 'Autre', icon: 'more-horiz', iconLib: 'MaterialIcons' },
};

// Currency display
const CURRENCIES: Record<string, { label: string; symbol: string }> = {
  XAF: { label: 'CFA', symbol: 'FCFA' },
  USD: { label: 'Dollar', symbol: '$' },
  EUR: { label: 'Euro', symbol: '€' },
  CNY: { label: 'Yuan', symbol: '¥' },
};
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
// --- PROPS INTERFACES ---
interface ItemDataProps {
  itemData?: {
    ownerCriteria?: OwnerCriteria;
    type?: PropertyType | string;
    listType?: 'rent' | 'sale' | string;
    generalInfo?: any;
    _selectedUnit?: {
      roomName?: string;
      description?: string;
      price?: number;
      currency?: string;
      capacity?: number;
      amenities?: string[];
    };
  }
}
// --- TYPE DEFINITIONS ---
interface CriteriaCardProps {
  icon: React.ReactNode;
  value: string | undefined;
  title: string;
  bgColor: string;
}
interface SituationChipProps {
  text: string;
  index: number;
}
interface DocumentCardProps {
  title: string;
  docs: string[];
  icon: React.ReactNode;
  accentColor: string;
}
// --- SUB-COMPONENTS DEFINITIONS ---
const CriteriaCard = ({ icon, value, title, bgColor }: CriteriaCardProps) => (
  <ThemedView variant="surface" style={styles.criteriaCard}>
    <ThemedView style={[styles.criteriaIconBox, { backgroundColor: bgColor }]}>
      {icon}
    </ThemedView>
    <ThemedText type="caption"  style={styles.criteriaLabel}>{title}</ThemedText>
    <ThemedText type="normal" intensity="light" style={{...styles.criteriaValue, fontWeight:800}}>{value || '-'}</ThemedText>

  </ThemedView>
);
const SituationChip = ({ text }: SituationChipProps) => {
  return (
    <ThemedView variant="surfaceVariant" style={[styles.situationChip]}>
      <Ionicons name="checkmark-circle" size={16} color={"#6B7280"} />
      <ThemedText type="caption" intensity="strong">{text}</ThemedText>
    </ThemedView>
  );
};
const DocumentCard = ({ title, docs, icon, accentColor }: DocumentCardProps) => (
  <ThemedView variant="surface" style={styles.documentCard}>
    <ThemedView style={styles.documentHeader}>
      <ThemedView style={[styles.documentIconBox, { backgroundColor: accentColor + '20' }]}>
        {icon}
      </ThemedView>
      <ThemedText type="body" intensity="strong" color={accentColor}>{title}</ThemedText>
    </ThemedView>
    <ThemedView style={styles.documentList}>
      {docs.map((doc, docIndex) => (
        <ThemedView key={docIndex} style={styles.documentItem}>
          <ThemedView style={[styles.documentBullet, { backgroundColor: accentColor }]} />
          <ThemedText type="caption" style={styles.documentText}>{doc}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  </ThemedView>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <ThemedView  style={styles.sectionHeader}>
    <ThemedText type="normaltitle" >{title}</ThemedText>
    {subtitle && <ThemedText type="caption" className ="pt-2" >{subtitle}</ThemedText>}
  </ThemedView>
);

// --- MAIN COMPONENT DEFINITION ---

export default function Criteria({ itemData }: ItemDataProps) {
  const item = itemData;

  // Déterminer le type de propriété
  const isLand = isLandProperty(item?.type);
  const isSale = item?.listType === 'sale';
  const config = getPropertyDisplayConfig(item?.type);

  // Pour les terrains, afficher les exigences principales et documents
  if (isLand) {
    const hasDocuments = item?.generalInfo?.documents && item.generalInfo.documents.length > 0;

    // Pour les terrains, on affiche toujours la section exigences principales (devise, paiement)
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Documents légaux si disponibles */}
        {hasDocuments && (
          <ThemedView style={styles.section}>
            <SectionHeader title="Documents disponibles" subtitle="Pièces légales du terrain" />
            <ThemedView style={styles.situationsContainer}>
              {item.generalInfo.documents.map((doc: string, index: number) => (
                <ThemedView key={index} variant="surfaceVariant" style={styles.situationChip}>
                  <MaterialCommunityIcons name="file-document-outline" size={16} color="#4F46E5" />
                  <ThemedText type="caption" intensity="strong">{doc}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <SectionHeader title="Exigences principales" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.criteriaScrollContent}
          >
            <CriteriaCard
              icon={<FontAwesome5 name="money-bill-wave" size={20} color="#10B981" />}
              title="Devise"
              value={item?.ownerCriteria?.currency
                ? `${CURRENCIES[item.ownerCriteria.currency]?.symbol || item.ownerCriteria.currency}`
                : CURRENCIES.XAF.symbol}
              bgColor="#ECFDF5"
            />

            <CriteriaCard
              icon={<MaterialIcons name="payments" size={24} color="#F97316" />}
              title="Paiements"
              value={
                item?.ownerCriteria?.acceptedPaymentMethods && item.ownerCriteria.acceptedPaymentMethods.length > 0
                  ? item.ownerCriteria.acceptedPaymentMethods.map((m: string) => PAYMENT_METHODS[m]?.label || m).join(', ')
                  : 'Non spécifié'
              }
              bgColor="#FFF7ED"
            />
          </ScrollView>
        </ThemedView>
      </ScrollView>
    );
  }

  if (!item || !item.ownerCriteria) {
    return (
      <ThemedView variant="surfaceVariant" style={styles.emptyContainer}>
        <ThemedView variant="surfaceVariant" style={styles.emptyIconBox}>
          <MaterialIcons name="error-outline" size={48} color="#9CA3AF" />
        </ThemedView>
        <ThemedText type="subtitle" intensity="strong">Critères non disponibles</ThemedText>
      </ThemedView>
    );
  }

  // Get currency display
  const currencyCode = item.ownerCriteria.currency || 'XAF';
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.XAF;

  // Get payment methods - formater pour l'affichage
  const paymentMethodsArray = item.ownerCriteria.acceptedPaymentMethods || ['cash'];
  const paymentMethodsDisplay = paymentMethodsArray
    .map(method => PAYMENT_METHODS[method]?.label || method)
    .join(', ');

  // Critères adaptés selon le type (vente vs location)
  const criteriaList = isSale ? [
    {
      id: "2",
      icon: <FontAwesome5 name="money-bill-wave" size={20} color="#10B981" />,
      title: "Devise",
      value: `${currencyInfo.symbol} (${currencyInfo.label})`,
      bgColor: "#ECFDF5",
    },
    {
      id: "3",
      icon: <MaterialIcons name="payments" size={24} color="#F97316" />,
      title: "Paiements",
      value: paymentMethodsDisplay,
      bgColor: "#FFF7ED",
    },
  ] : [
    {
      id: "1",
      icon: <MaterialIcons name="hourglass-empty" size={24} color="#4F46E5" />,
      title: "Durée minimum",
      value: item.ownerCriteria.minimumDuration ? `${item.ownerCriteria.minimumDuration} mois` : '-',
      bgColor: "#EEF2FF",
    },
    {
      id: "2",
      icon: <FontAwesome5 name="money-bill-wave" size={20} color="#10B981" />,
      title: "Devise",
      value: `${currencyInfo.symbol} (${currencyInfo.label})`,
      bgColor: "#ECFDF5",
    },
    {
      id: "3",
      icon: <MaterialIcons name="payments" size={24} color="#F97316" />,
      title: "Paiements",
      value: paymentMethodsDisplay,
      bgColor: "#FFF7ED",
    },
  ];

  const situations = item.ownerCriteria.acceptedSituations ?? [];

  // Vérifier si des documents sont requis par le propriétaire
  const isDocumentRequired = item.ownerCriteria.isdocumentRequired || item.ownerCriteria.isDocumentRequired;
  const requiredDocuments = item.ownerCriteria.requiredDocuments || { tenant: [], guarantor: [] };

  // Documents du locataire - seulement si des documents sont requis ET qu'il y a des documents listés
  const tenantDocs = isDocumentRequired ? (requiredDocuments.tenant || []) : [];

  // Vérifier si un garant est requis (supporte les deux noms de champ)
  const isGuarantorRequired = item.ownerCriteria.guarantorRequired || item.ownerCriteria.isGarantRequired;
  // Documents du garant - seulement si garant requis ET documents requis ET qu'il y a des documents listés
  const guarantorDocs = (isGuarantorRequired && isDocumentRequired) ? (requiredDocuments.guarantor || []) : [];

  // Vérifier si on doit afficher la section des documents
  const hasDocumentsToShow = tenantDocs.length > 0 || guarantorDocs.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Selected room info */}
      {item._selectedUnit && (
        <ThemedView style={[styles.section, { padding: 12 }]}>
          <SectionHeader title={`Critères — ${item._selectedUnit.roomName}`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.criteriaScrollContent}
          >
            {item._selectedUnit.price != null && item._selectedUnit.price > 0 && (
              <CriteriaCard
                icon={<FontAwesome5 name="money-bill-wave" size={20} color="#6366F1" />}
                title="Loyer chambre"
                value={`${item._selectedUnit.price.toLocaleString()} ${item._selectedUnit.currency || currencyInfo.symbol}/mois`}
                bgColor="#EEF2FF"
              />
            )}
            {item._selectedUnit.capacity && (
              <CriteriaCard
                icon={<Ionicons name="people" size={20} color="#3B82F6" />}
                title="Capacité"
                value={`${item._selectedUnit.capacity} pers. max`}
                bgColor="#EFF6FF"
              />
            )}
          </ScrollView>
          {/* Room amenities in criteria */}
          {item._selectedUnit.amenities && item._selectedUnit.amenities.length > 0 && (
            <ThemedView style={{ marginTop: 10 }}>
              <ThemedText type="normal"style={{ marginBottom: 6 }}>Commodités de la chambre</ThemedText>
              <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {item._selectedUnit.amenities.map((amenity: string, idx: number) => (
                  <ThemedView key={idx} variant="surfaceVariant" style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#6366F1" />
                    <ThemedText type="caption">{amenity}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      )}

      {/* Key Criteria Section */}
      <ThemedView style={styles.section}>
        <SectionHeader title="Exigences principales" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.criteriaScrollContent}
        >
          {criteriaList.map((criteria) => (
            <CriteriaCard
              key={criteria.id}
              icon={criteria.icon}
              title={criteria.title}
              value={criteria.value}
              bgColor={criteria.bgColor}
            />
          ))}
        </ScrollView>
      </ThemedView>

      {/* Accepted Profiles Section */}
      {situations.length > 0 && (
        <ThemedView style={styles.section}>
          <SectionHeader
            title="Profils recherchés"
            subtitle="Types de locataires acceptés"
          />
          <ThemedView style={styles.situationsContainer}>
            {situations.map((situation, index) => (
              <SituationChip key={index} text={situation} index={index} />
            ))}
          </ThemedView>
        </ThemedView>
      )}

      {/* Required Documents Section - Only show if there are documents */}
      {hasDocumentsToShow && (
        <ThemedView style={styles.section}>
          <SectionHeader
            title="Dossier à fournir"
            subtitle="Documents requis pour votre candidature"
          />
          <ThemedView style={styles.documentsGrid}>
            {tenantDocs.length > 0 && (
              <DocumentCard
                title="Locataire"
                docs={tenantDocs}
                icon={<Ionicons name="person" size={18} color="#4F46E5" />}
                accentColor="#4F46E5"
              />
            )}
            {isGuarantorRequired && guarantorDocs.length > 0 && (
              <DocumentCard
                title="Garant"
                docs={guarantorDocs}
                icon={<Ionicons name="shield-checkmark" size={20} color="#10B981" />}
                accentColor="#10B981"
              />
            )}
          </ThemedView>
        </ThemedView>
      )}

      {/* Information Card - Only show if documents section is shown */}
      {hasDocumentsToShow && (
        <ThemedView variant="surfaceVariant" style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <ThemedText type="caption"  style={styles.infoText}>
            Préparez ces documents à l'avance pour accélérer votre candidature
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

// --- STYLESHEET DEFINITIONS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    },
  contentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop:0,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 10,
  },
 
  sectionSubtitle: {
    marginTop: 4,
  },
  criteriaScrollContent: {
    paddingRight: 20,
  },
  criteriaCard: {
    padding: 10,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
  },
  criteriaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  criteriaValue: {
    textAlign: 'center',
    marginBottom: 4,
  },
  criteriaLabel: {
    textAlign: 'center',
  },
  situationsContainer: {
    paddingTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  situationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal:8,
    borderRadius: 12,
    gap: 8,
  },
  situationText: {
  },
  documentsGrid: {
    gap: 12,
  },
  documentCard: {
    borderRadius: 8,
    padding: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  documentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentTitle: {
  },
  documentList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  documentBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  documentText: {
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
