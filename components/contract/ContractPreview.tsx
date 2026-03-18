import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { ContractType } from '@/types/contract';
import { Property, Reservation, User } from '@/types/type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ContractPreviewProps {
  contractId: string;
  contractType: ContractType;
  property: Property;
  reservation: Reservation;
  buyer?: User;
  seller?: User;
  landlord?: User;
  tenant?: User;
  purchasePrice?: number;
  earnestMoney?: number;
  onSign?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  paymentCompleted?: boolean;
  propertyImage?: string;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  contractId,
  contractType,
  property,
  reservation,
  buyer,
  seller,
  landlord,
  tenant,
  purchasePrice,
  earnestMoney,
  onSign,
  onDownload,
  onShare,
  paymentCompleted = false,
  propertyImage,
}) => {
  const { theme } = useTheme();
  const [isSigningMode, setIsSigningMode] = useState(false);

  const isPurchase = contractType === ContractType.PURCHASE;
  const isRental = contractType === ContractType.RENTAL || contractType === ContractType.VACATION_RENTAL;

  // Party information
  const party1 = isPurchase ? seller : landlord;
  const party2 = isPurchase ? buyer : tenant;
  const party1Label = isPurchase ? 'Vendeur' : 'Bailleur';
  const party2Label = isPurchase ? 'Acheteur' : 'Locataire';

  // Financial calculations
  const price = isPurchase
    ? (purchasePrice || property.depositAmount * 100 || 0)
    : (reservation.monthlyRent || 0);

  const deposit = isPurchase
    ? (earnestMoney || price * 0.1)
    : (property.depositAmount || reservation.monthlyRent * 2);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: any): string => {
    if (!date) return '---';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const styles = createStyles(theme);

  return (
    <ThemedView
      style={styles.container}
    >
      {/* Contract Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32']}
        style={styles.headerGradient}
      >
        <ThemedView style={{...styles.headerContent,  backgroundColor:"transparent"}}>
          <ThemedView style={{...styles.headerTextContainer, backgroundColor:"transparent"}}>
            <ThemedText style={styles.headerTitle}>
              {isPurchase ? 'CONTRAT DE VENTE' : 'CONTRAT DE BAIL'}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {isPurchase ? 'Achat et Vente Immobilier' : "Bail d'Habitation"}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.contractBadge}>
            <MaterialCommunityIcons
              name={isPurchase ? 'home-city' : 'home-account'}
              size={24}
              color="white"
            />
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contract ID Section */}
        <ThemedView style={styles.contractIdSection}>
          <ThemedView style={styles.contractIdBadge}>
            <MaterialCommunityIcons name="qrcode-scan" size={16} color={theme.primary} />
            <ThemedText style={styles.contractIdText}>
              {contractId}
            </ThemedText>
          </ThemedView>
          <ThemedView style={[
            styles.statusBadge,
            paymentCompleted ? styles.statusActive : styles.statusPending
          ]}>
            <ThemedText style={[
              styles.statusText,
              { color: paymentCompleted ? '#1B5E20' : '#E65100' }
            ]}>
              {paymentCompleted ? 'Paiement Validé' : 'En Attente'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Property Card */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <MaterialCommunityIcons name="home-map-marker" size={18} color="white" />
            <ThemedText style={styles.sectionHeaderText}>PROPRIÉTÉ</ThemedText>
          </ThemedView>

          <ThemedView style={styles.propertyCard}>
            <ThemedView style={styles.propertyImageContainer}>
              {propertyImage ? (
                <Image source={{ uri: propertyImage }} style={styles.propertyImage} />
              ) : (
                <LinearGradient
                  colors={['#e8e8e8', '#f5f5f5']}
                  style={styles.propertyImagePlaceholder}
                >
                  <FontAwesome5 name="building" size={40} color="#bdbdbd" />
                </LinearGradient>
              )}
            </ThemedView>

            <ThemedView style={styles.propertyInfo}>
              <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
              <ThemedView style={styles.propertyDetailRow}>
                <Ionicons name="location-outline" size={14} color={theme.onSurface + '80'} />
                <ThemedText style={styles.propertyAddress}>{property.address}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.propertyStats}>
                <ThemedView style={styles.propertyStat}>
                  <MaterialCommunityIcons name="ruler-square" size={14} color={theme.primary} />
                  <ThemedText style={styles.propertyStatText}>{property.surface} m²</ThemedText>
                </ThemedView>
                <ThemedView style={styles.propertyStat}>
                  <MaterialCommunityIcons name="door" size={14} color={theme.primary} />
                  <ThemedText style={styles.propertyStatText}>{property.rooms} pièces</ThemedText>
                </ThemedView>
                <ThemedView style={styles.propertyStat}>
                  <MaterialCommunityIcons name="home-variant" size={14} color={theme.primary} />
                  <ThemedText style={styles.propertyStatText}>{property.type}</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-group" size={18} color="white" />
            <ThemedText style={styles.sectionHeaderText}>PARTIES</ThemedText>
          </ThemedView>

          <ThemedView style={styles.partiesContainer}>
            {/* Party 1 */}
            <ThemedView style={styles.partyCard}>
              <ThemedView style={[styles.partyBadge, { backgroundColor: theme.primary + '20' }]}>
                <MaterialCommunityIcons
                  name={isPurchase ? 'account-cash' : 'account-key'}
                  size={20}
                  color={theme.primary}
                />
              </ThemedView>
              <ThemedText style={styles.partyLabel}>{party1Label}</ThemedText>
              <ThemedText style={styles.partyName}>{party1?.fullName || '---'}</ThemedText>
              <ThemedText style={styles.partyContact}>{party1?.email || '---'}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.partyDivider}>
              <MaterialCommunityIcons name="arrow-right" size={20} color={theme.outline} />
            </ThemedView>

            {/* Party 2 */}
            <ThemedView style={styles.partyCard}>
              <ThemedView style={[styles.partyBadge, { backgroundColor: '#4CAF50' + '20' }]}>
                <MaterialCommunityIcons
                  name={isPurchase ? 'account-check' : 'account-heart'}
                  size={20}
                  color="#4CAF50"
                />
              </ThemedView>
              <ThemedText style={styles.partyLabel}>{party2Label}</ThemedText>
              <ThemedText style={styles.partyName}>{party2?.fullName || '---'}</ThemedText>
              <ThemedText style={styles.partyContact}>{party2?.email || '---'}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Financial Details */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={[styles.sectionHeader, { backgroundColor: '#4CAF50' }]}>
            <MaterialCommunityIcons name="currency-usd" size={18} color="white" />
            <ThemedText style={styles.sectionHeaderText}>
              {isPurchase ? 'CONDITIONS DE VENTE' : 'CONDITIONS FINANCIÈRES'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.financialCard}>
            {/* Main Price */}
            <ThemedView style={styles.mainPriceContainer}>
              <ThemedText style={styles.mainPriceLabel}>
                {isPurchase ? 'Prix de Vente' : 'Loyer Mensuel'}
              </ThemedText>
              <ThemedText style={styles.mainPriceValue}>
                {formatCurrency(price)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.financialDivider} />

            {/* Secondary Details */}
            <ThemedView style={styles.financialDetails}>
              <ThemedView style={styles.financialRow}>
                <ThemedView style={styles.financialIcon}>
                  <MaterialCommunityIcons name="shield-check" size={16} color={theme.primary} />
                </ThemedView>
                <ThemedText style={styles.financialLabel}>
                  {isPurchase ? 'Acompte (Earnest Money)' : 'Dépôt de Garantie'}
                </ThemedText>
                <ThemedText style={styles.financialValue}>
                  {formatCurrency(deposit)}
                </ThemedText>
              </ThemedView>

              {!isPurchase && (
                <>
                  <ThemedView style={styles.financialRow}>
                    <ThemedView style={styles.financialIcon}>
                      <MaterialCommunityIcons name="calendar-start" size={16} color={theme.primary} />
                    </ThemedView>
                    <ThemedText style={styles.financialLabel}>Début du Bail</ThemedText>
                    <ThemedText style={styles.financialValue}>
                      {formatDate(reservation.startDate)}
                    </ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.financialRow}>
                    <ThemedView style={styles.financialIcon}>
                      <MaterialCommunityIcons name="calendar-end" size={16} color={theme.primary} />
                    </ThemedView>
                    <ThemedText style={styles.financialLabel}>Fin du Bail</ThemedText>
                    <ThemedText style={styles.financialValue}>
                      {formatDate(reservation.endDate)}
                    </ThemedText>
                  </ThemedView>
                </>
              )}

              {isPurchase && (
                <ViThemedViewew style={styles.financialRow}>
                  <ThemedView style={styles.financialIcon}>
                    <MaterialCommunityIcons name="calendar-check" size={16} color={theme.primary} />
                  </ThemedView>
                  <ThemedText style={styles.financialLabel}>Mode de Paiement</ThemedText>
                  <ThemedText style={styles.financialValue}>
                    Comptant ou équivalent
                  </ThemedText>
                </ViThemedViewew>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Signature Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={[styles.sectionHeader, { backgroundColor: '#FF9800' }]}>
            <MaterialCommunityIcons name="draw-pen" size={18} color="white" />
            <ThemedText style={styles.sectionHeaderText}>SIGNATURES</ThemedText>
          </ThemedView>

          <ThemedView style={styles.signatureContainer}>
            {/* Party 1 Signature */}
            <ThemedView style={styles.signatureBox}>
              <ThemedView style={styles.signatureHeader}>
                <ThemedText style={styles.signatureRole}>{party1Label}</ThemedText>
                <ThemedView style={styles.signatureStatusPending}>
                  <ThemedText style={styles.signatureStatusText}>En attente</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.signatureName}>{party1?.fullName || '---'}</ThemedText>
              <ThemedView style={styles.signatureLine}>
                <MaterialCommunityIcons name="gesture" size={20} color={theme.outline} />
                <ThemedText style={styles.signatureLinePlaceholder}>Signer ici</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Party 2 Signature */}
            <ThemedView style={styles.signatureBox}>
              <ThemedView style={styles.signatureHeader}>
                <ThemedText style={styles.signatureRole}>{party2Label}</ThemedText>
                <ThemedView style={styles.signatureStatusPending}>
                  <ThemedText style={styles.signatureStatusText}>En attente</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.signatureName}>{party2?.fullName || '---'}</ThemedText>
              <ThemedView style={styles.signatureLine}>
                <MaterialCommunityIcons name="gesture" size={20} color={theme.outline} />
                <ThemedText style={styles.signatureLinePlaceholder}>Signer ici</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        {paymentCompleted && (
          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={onSign}
            >
              <LinearGradient
                colors={['#1B5E20', '#2E7D32']}
                style={styles.primaryActionGradient}
              >
                <MaterialCommunityIcons name="draw-pen" size={20} color="white" />
                <ThemedText style={styles.primaryActionText}>Signer le Contrat</ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <ThemedView style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryAction} onPress={onDownload}>
                <MaterialCommunityIcons name="download" size={20} color={theme.primary} />
                <ThemedText style={styles.secondaryActionText}>Télécharger</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryAction} onPress={onShare}>
                <MaterialCommunityIcons name="share-variant" size={20} color={theme.primary} />
                <ThemedText style={styles.secondaryActionText}>Partager</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}

        {/* Legal Notice */}
        <ThemedView style={styles.legalNotice}>
          <MaterialCommunityIcons name="shield-lock" size={16} color={theme.onSurface + '60'} />
          <ThemedText style={styles.legalNoticeText}>
            Ce contrat est sécurisé et conforme à la réglementation en vigueur.
            Toutes les signatures électroniques sont légalement contraignantes.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  contractBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  contractIdSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline + '20',
  },
  contractIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contractIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sectionContainer: {
    marginHorizontal: 4,
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  propertyCard: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.outline + '30',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  propertyImageContainer: {
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.onSurface,
    marginBottom: 6,
  },
  propertyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyAddress: {
    fontSize: 11,
    color: theme.onSurface + '80',
    marginLeft: 4,
    flex: 1,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  propertyStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyStatText: {
    fontSize: 11,
    color: theme.onSurface,
    fontWeight: '500',
    marginLeft: 4,
  },
  partiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.outline + '30',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  partyCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  partyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.onSurface,
    textAlign: 'center',
  },
  partyContact: {
    fontSize: 9,
    color: theme.onSurface + '60',
    textAlign: 'center',
    marginTop: 2,
  },
  partyDivider: {
    paddingHorizontal: 8,
  },
  financialCard: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.outline + '30',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
  },
  mainPriceContainer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  mainPriceLabel: {
    fontSize: 11,
    color: theme.onSurface + '70',
    marginBottom: 4,
  },
  mainPriceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
  },
  financialDivider: {
    height: 1,
    backgroundColor: theme.outline + '30',
    marginVertical: 12,
  },
  financialDetails: {
    gap: 8,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  financialLabel: {
    flex: 1,
    fontSize: 11,
    color: theme.onSurface + '80',
  },
  financialValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.onSurface,
  },
  signatureContainer: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.outline + '30',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    gap: 12,
  },
  signatureBox: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.outline + '20',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline + '20',
  },
  signatureRole: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  signatureStatusPending: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  signatureStatusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#E65100',
  },
  signatureName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.onSurface,
    marginBottom: 8,
  },
  signatureLine: {
    height: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.outline + '40',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  signatureLinePlaceholder: {
    fontSize: 10,
    color: theme.outline,
    marginLeft: 6,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  primaryAction: {
    marginBottom: 12,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.primary + '10',
  },
  secondaryActionText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.outline + '20',
  },
  legalNoticeText: {
    flex: 1,
    fontSize: 9,
    color: theme.onSurface + '60',
    marginLeft: 8,
    lineHeight: 14,
  },
});

export default ContractPreview;
