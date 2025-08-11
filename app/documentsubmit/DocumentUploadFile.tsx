import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { CustomButton } from '@/components/ui';
import { Property } from '@/types/property';
import { BackButton } from '@/components/ui/BackButton';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useNotifications } from '@/components/contexts/notifications/NotificationContext';
import { useBooking } from '@/components/contexts/booking/BookingContext';


// Liste complète des documents possibles
const allDocuments = [
  { id: 'idCard', name: 'Pièce d\'identité' },
  { id: 'proofOfIncome', name: 'Justificatif de revenus' },
  { id: 'proofOfAddress', name: 'Justificatif de domicile' },
  { id: 'taxReturn', name: 'Dernier avis d\'imposition' },
  { id: 'employmentContract', name: 'Contrat de travail' },
  { id: 'guarantorDocuments', name: 'Documents du garant' },
];

const DocumentUploadScreen = () => {
  const route = useRoute()
  const { theme } = useTheme()
  const { addNotification } = useNotifications();
  const { updateReservationDocuments, updateReservationStatus } = useBooking();
  const params = route.params as { reservationId: string, property: string };
  const reservationId = params?.reservationId;
  const property = params?.property ? JSON.parse(params.property) : null;
  const router = useRouter();
  const [documents, setDocuments] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [hasDocuments, setHasDocuments] = useState<boolean | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<Array<{id: string, name: string}>>([]);
  const [documentApprovalStatus, setDocumentApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Simuler les critères du propriétaire (en réalité, cela viendrait de l'API)
  const ownerDocumentRequirements = property?.documentRequirements || ['idCard', 'proofOfIncome'];

  useEffect(() => {
    // Filtrer les documents requis selon les critères du propriétaire
    const ownerRequiredDocs = allDocuments.filter(doc => 
      ownerDocumentRequirements.includes(doc.id)
    );
    setRequiredDocuments(ownerRequiredDocs);
  }, [property]);

  // Si aucun document n'est requis par le propriétaire, rediriger directement
  useEffect(() => {
    if (requiredDocuments.length === 0) {
      // Update reservation status to indicate no documents needed
      if (reservationId) {
        updateReservationStatus(reservationId, 'approved');
      }
      router.push('/finalBooking/bookingstatus');
    }
  }, [requiredDocuments, reservationId]);

  const pickDocument = async (docId: string) => {
    try {
      setUploading(docId);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setUploading(null);
        return;
      }
      
      const file = result.assets[0];
      
      // Simuler l'upload réussi avec l'URI du fichier local
      setDocuments(prev => ({
        ...prev,
        [docId]: file.uri,
      }));
      
      setUploading(null);
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du téléchargement du document.');
      setUploading(null);
    }
  };

  const submitDocuments = async () => {
    try {
      setLoading(true);
      
      // Vérifier que tous les documents requis sont téléchargés
      const missingRequiredDocs = requiredDocuments
        .filter(doc => !documents[doc.id])
        .map(doc => doc.name);
      
      if (missingRequiredDocs.length > 0) {
        Alert.alert(
          'Documents manquants',
          `Veuillez télécharger les documents suivants: ${missingRequiredDocs.join(', ')}`
        );
        setLoading(false);
        return;
      }
      
      // Update reservation with documents
      const submittedDocs = Object.keys(documents).filter(key => documents[key]);
      if (reservationId) {
        updateReservationDocuments(reservationId, submittedDocs, true);
      }
      
      // Envoyer notification au propriétaire avec actions
      addNotification({
        type: 'document_uploaded',
        title: 'Nouveaux documents à examiner',
        message: `Des documents ont été soumis pour la propriété ${property?.title}`,
        data: {
          reservationId,
          propertyId: property?.id,
          documents: submittedDocs,
          canApprove: true
        }
      });
      
      setDocumentApprovalStatus('pending');
      
      // Simuler l'envoi au backend et attendre l'approbation
      setTimeout(() => {
        Alert.alert(
          'Documents soumis',
          'Vos documents ont été soumis avec succès. Le propriétaire va les examiner. Vous pouvez continuer le processus ou attendre l\'approbation.',
          [
            { text: 'Attendre l\'approbation', style: 'cancel' },
            { text: 'Continuer maintenant', onPress: () => router.push('/finalBooking/bookingstatus') }
          ]
        );
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Document submission error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission de vos documents.');
      setLoading(false);
    }
  };

  // Simuler l'approbation du propriétaire (en réalité, cela viendrait via WebSocket ou polling)
  const simulateOwnerApproval = () => {
    setTimeout(() => {
      setDocumentApprovalStatus('approved');
      // Update reservation status to approved
      if (reservationId) {
        updateReservationStatus(reservationId, 'approved');
      }
      
      // Send approval notification to client
      addNotification({
        type: 'booking_confirmed',
        title: 'Réservation approuvée',
        message: `Votre réservation pour ${property?.title} a été approuvée. Vous pouvez maintenant procéder au paiement.`,
        data: {
          reservationId,
          propertyId: property?.id,
          status: 'approved'
        }
      });
      
      Alert.alert(
        'Documents approuvés',
        'Le propriétaire a approuvé vos documents. Vous pouvez maintenant continuer le processus de réservation.',
        [
          { text: 'Continuer', onPress: () => router.push('/finalBooking/bookingstatus') }
        ]
      );
    }, 3000); // Simuler 3 secondes d'attente
  };

  const continueWithoutDocuments = () => {
    // Update reservation status
    if (reservationId) {
      updateReservationStatus(reservationId, 'pending');
    }
    
    // Notifier le propriétaire que le client continue sans documents
    addNotification({
      type: 'general',
      title: 'Réservation sans documents',
      message: `Un client continue la réservation sans soumettre les documents pour ${property?.title}`,
      data: {
        reservationId,
        propertyId: property?.id,
        reason: 'Client chose to continue without documents'
      }
    });
    
    Alert.alert(
      'Continuer sans documents',
      'Le propriétaire sera informé que vous continuez sans documents. Vous pourrez les soumettre plus tard si nécessaire.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => router.push('/finalBooking/bookingstatus') }
      ]
    );
  };

  // Si aucun document requis, ne pas afficher cette page
  if (requiredDocuments.length === 0) {
    return null;
  }

  // Si pas de reservationId, rediriger vers booking
  if (!reservationId) {
    router.push('/booking/bookingscreen');
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:theme.surface }}>
      {/* <LinearGradient
        colors={[theme.primary + '10', theme.background]}
        style={{ flex: 1 }}
      > */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 6, backgroundColor:theme.surface }}>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{ marginBottom: 24, paddingHorizontal:2 }}
          >
            <ThemedView  style={{ flexDirection: 'row', alignItems: 'space-between', gap: 10, marginBottom: 16 }}>
              <BackButton />
              <ThemedText type = "title" intensity="strong" style={{
                color: theme.onSurface,
                textAlign: 'center'
              }}>
                Documents requis
              </ThemedText>
            </ThemedView>
            
            <ThemedText type = "normal" style={{
              color: theme.onSurface + '70',
              textAlign: 'center',
              marginBottom: 8
            }}>
              {requiredDocuments.length > 0 
                ? `Le propriétaire demande ${requiredDocuments.length} document(s)`
                : 'Aucun document requis par le propriétaire'
              }
            </ThemedText>
          </MotiView>

          {hasDocuments === null && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <ThemedView style={{
                backgroundColor: theme.surfaceVariant,
                borderRadius: 16,
                padding: 22,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
                elevation: 1
              }}>
                <ThemedText type = "normal" style={{
                  fontWeight: '600',
                  color: theme.onSurface,
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  Avez-vous vos documents prêts ?
                </ThemedText>
                
                <ThemedView style={{ gap: 12 }}>
                  <CustomButton
                    title="Oui, j'ai mes documents"
                    onPress={() => setHasDocuments(true)}
                    type="primary"
                    icon={<MaterialCommunityIcons name="file-document" size={20} color="white" />}
                  />
                  
                  <CustomButton
                    title="Non, continuer sans documents"
                    onPress={() => setHasDocuments(false)}
                    type="outline"
                    icon={<MaterialCommunityIcons name="arrow-right" size={20} color={theme.primary} />}
                  />
                </ThemedView>
              </ThemedView>
            </MotiView>
          )}

          {hasDocuments === true && (
            <MotiView
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <ThemedView style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <ThemedText style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.onSurface,
                  marginBottom: 8
                }}>
                  Télécharger vos documents
                </ThemedText>
                
                <ThemedText style={{
                  fontSize: 14,
                  color: theme.onSurface + '70',
                  marginBottom: 20
                }}>
                  Documents demandés par le propriétaire. Tous sont requis pour cette propriété.
                </ThemedText>
                
                {documentApprovalStatus === 'pending' && (
                  <ThemedView style={{
                    backgroundColor: '#fbbf2410',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#fbbf24'
                  }}>
                    <ThemedText style={{ color: '#92400e', fontSize: 14, fontWeight: '600' }}>
                      ⏳ En attente d'approbation du propriétaire
                    </ThemedText>
                    <ThemedText style={{ color: '#92400e', fontSize: 12, marginTop: 4 }}>
                      Vos documents sont en cours d'examen
                    </ThemedText>
                  </ThemedView>
                )}
                
                {documentApprovalStatus === 'approved' && (
                  <ThemedView style={{
                    backgroundColor: '#10b98110',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#10b981'
                  }}>
                    <ThemedText style={{ color: '#065f46', fontSize: 14, fontWeight: '600' }}>
                      ✅ Documents approuvés par le propriétaire
                    </ThemedText>
                    <ThemedText style={{ color: '#065f46', fontSize: 12, marginTop: 4 }}>
                      Vous pouvez maintenant continuer le processus
                    </ThemedText>
                  </ThemedView>
                )}
                
                <ThemedView style={{ gap: 12, marginBottom: 20 }}>
                  {requiredDocuments.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      onPress={() => pickDocument(doc.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: documents[doc.id] ? '#10b981' : theme.outline + '30',
                        backgroundColor: documents[doc.id] ? '#10b98110' : theme.background
                      }}
                    >
                      <ThemedView style={{ flex: 1 }}>
                        <ThemedText style={{
                          fontWeight: '600',
                          color: theme.onSurface,
                          marginBottom: 4
                        }}>
                          {doc.name} <Text style={{ color: '#ef4444' }}>*</Text>
                        </ThemedText>
                        {documents[doc.id] ? (
                          <Text style={{ color: '#10b981', fontSize: 12 }}>Document téléchargé</Text>
                        ) : (
                          <Text style={{ color: theme.onSurface + '60', fontSize: 12 }}>Cliquez pour télécharger</Text>
                        )}
                      </ThemedView>
                      
                      {uploading === doc.id ? (
                        <MaterialCommunityIcons name="loading" size={24} color={theme.primary} />
                      ) : documents[doc.id] ? (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      ) : (
                        <Ionicons name="cloud-upload-outline" size={24} color={theme.onSurface + '60'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ThemedView>
                
                <CustomButton
                  title={documentApprovalStatus === 'pending' ? 'Documents soumis' : 'Soumettre les documents'}
                  onPress={documentApprovalStatus === 'pending' ? simulateOwnerApproval : submitDocuments}
                  loading={loading}
                  disabled={loading || uploading !== null}
                  type={documentApprovalStatus === 'pending' ? 'outline' : 'primary'}
                />
                
                {documentApprovalStatus === 'pending' && (
                  <CustomButton
                    title="Continuer sans attendre"
                    onPress={() => router.push('/finalBooking/bookingstatus')}
                    type="outline"
                    style={{ marginTop: 12 }}
                  />
                )}
                
                {documentApprovalStatus === 'approved' && (
                  <CustomButton
                    title="Continuer le processus"
                    onPress={() => router.push('/finalBooking/bookingstatus')}
                    type="primary"
                    style={{ marginTop: 12 }}
                  />
                )}
                
                <TouchableOpacity 
                  style={{ alignItems: 'center', marginTop: 16 }}
                  onPress={() => setHasDocuments(null)}
                >
                  <ThemedText style={{ color: theme.primary }}>Retour aux options</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </MotiView>
          )}

          {hasDocuments === false && (
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <ThemedView style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <MaterialCommunityIcons 
                  name="information" 
                  size={48} 
                  color={theme.primary} 
                  style={{ alignSelf: 'center', marginBottom: 16 }}
                />
                
                <ThemedText style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.onSurface,
                  textAlign: 'center',
                  marginBottom: 12
                }}>
                  Continuer sans documents
                </ThemedText>
                
                <ThemedText style={{
                  fontSize: 14,
                  color: theme.onSurface + '70',
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 20
                }}>
                  Vous pouvez continuer sans soumettre les documents maintenant. 
                  Le propriétaire sera informé que vous procéderez sans documents pour le moment.
                </ThemedText>
                
                <CustomButton
                  title="Continuer quand même"
                  onPress={continueWithoutDocuments}
                  type="primary"
                  icon={<MaterialCommunityIcons name="arrow-right" size={20} color="white" />}
                />
                
                <TouchableOpacity 
                  style={{ alignItems: 'center', marginTop: 16 }}
                  onPress={() => setHasDocuments(null)}
                >
                  <ThemedText style={{ color: theme.primary }}>Retour aux options</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </MotiView>
          )}
        </ScrollView>
      {/* </LinearGradient> */}
    </SafeAreaView>
  );
};

export default DocumentUploadScreen;