
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OwnerCriteria } from "@/types/ItemType";
import { useTheme } from "../contexts/theme/themehook";
import React from "react";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
// --- PROPS INTERFACES ---
interface ItemDataProps {
  itemData?: {
    ownerCriteria?: OwnerCriteria;
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
  <ThemedView style={styles.criteriaCard}>
    <ThemedView style={[styles.criteriaIconBox, { backgroundColor: bgColor }]}>
      {icon}
    </ThemedView>
    <ThemedText style={styles.criteriaValue}>{value || '-'}</ThemedText>
    <ThemedText style={styles.criteriaLabel}>{title}</ThemedText>
  </ThemedView>
);
const SituationChip = ({ text, index }: SituationChipProps) => {
  return (
    <ThemedView style={[styles.situationChip]}>
      <Ionicons name="checkmark-circle" size={16} color= {"#6B7280" } />
      <ThemedText style={[styles.situationText]}>{text}</ThemedText>
    </ThemedView>
  );
};
const DocumentCard = ({ title, docs, icon, accentColor }: DocumentCardProps) => (
  <ThemedView style={styles.documentCard}>
    <ThemedView style={styles.documentHeader}>
      <ThemedView style={[styles.documentIconBox, { backgroundColor: accentColor + '20' }]}>
        {icon}
      </ThemedView>
      <ThemedText style={[styles.documentTitle, { color: accentColor }]}>{title}</ThemedText>
    </ThemedView>
    <ThemedView style={styles.documentList}>
      {docs.map((doc, docIndex) => (
        <ThemedView key={docIndex} style={styles.documentItem}>
          <ThemedView style={[styles.documentBullet, { backgroundColor: accentColor }]} />
          <ThemedText style={styles.documentText}>{doc}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  </ThemedView>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <ThemedView style={styles.sectionHeader}>
    <ThemedText type = 'subtitle' intensity="strong" style={styles.sectionTitle}>{title}</ThemedText>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </ThemedView>
);

// --- MAIN COMPONENT DEFINITION ---

export default function Criteria({ itemData }: ItemDataProps) {
  const { theme } = useTheme();
  const item = itemData;

  if (!item || !item.ownerCriteria) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedView style={styles.emptyIconBox}>
          <MaterialIcons name="error-outline" size={48} color="#9CA3AF" />
        </ThemedView>
        <ThemedText style={styles.emptyTitle}>Critères non disponibles</ThemedText>
      </ThemedView>
    );
  }

  const criteriaList = [
    {
      id: "1",
      icon: <MaterialIcons name="hourglass-empty" size={24} color="#4F46E5" />,
      title: "Durée minimum",
      value: item.ownerCriteria.minimumDuration,
      bgColor: "#EEF2FF",
    },
    {
      id: "2",
      icon: <AntDesign name="credit-card" size={24} color="#10B981" />,
      title: "Solvabilité",
      value: item.ownerCriteria.solvability,
      bgColor: "#ECFDF5",
    },
    {
      id: "3",
      icon: <Fontisto name="world-o" size={22} color="#F97316" />,
      title: "Garant résident",
      value: item.ownerCriteria.guarantorLocation,
      bgColor: "#FFF7ED",
    },
  ];

  const situations = item.ownerCriteria.acceptedSituations ?? [];
  const { tenant: tenantDocs, guarantor: guarantorDocs } = item.ownerCriteria.requiredDocuments;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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

      {/* Required Documents Section */}
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
          {guarantorDocs.length > 0 && (
            <DocumentCard
              title="Garant"
              docs={guarantorDocs}
              icon={<Ionicons name="shield-checkmark" size={20} color="#10B981" />}
              accentColor="#10B981"
            />
          )}
        </ThemedView>
      </ThemedView>

      {/* Information Card */}
      <ThemedView style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#6B7280" />
        <ThemedText style={styles.infoText}>
          Préparez ces documents à l'avance pour accélérer votre candidature
        </ThemedText>
      </ThemedView>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop:0,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 10,
  },
  sectionTitle: {
    // fontSize: 18,
    // fontWeight: '700',
    // color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  criteriaScrollContent: {
    paddingRight: 20,
  },
  criteriaCard: {
    backgroundColor: 'white',
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
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  criteriaLabel: {
    fontSize: 12,
    color: '#6B7280',
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
    fontSize: 12,
    fontWeight: '600',
  },
  documentsGrid: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: 'white',
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
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F7',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
