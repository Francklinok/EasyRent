import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { CustomButton } from '@/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import * as DocumentPicker from 'expo-document-picker';
import { getBookingService } from '@/services/api/bookingService';

interface DocumentUploadSectionProps {
  reservationId: string;
  onDocumentsUploaded: (documentIds: string[]) => void;
  onValidationStatusChange: (status: 'pending' | 'approved' | 'rejected', reason?: string) => void;
  required?: boolean;
}

interface UploadedDocument {
  id?: string;
  type: string;
  name: string;
  uri: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  reservationId,
  onDocumentsUploaded,
  onValidationStatusChange,
  required = false
}) => {
  const { theme } = useTheme();
  const bookingService = getBookingService();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const REQUIRED_DOCUMENTS = [
    { type: 'id_card', label: 'Pièce d\'identité', icon: 'card-account-details' },
    { type: 'proof_of_income', label: 'Justificatif de revenus', icon: 'currency-usd' },
    { type: 'proof_of_residence', label: 'Justificatif de domicile', icon: 'home-account' },
    { type: 'employment_contract', label: 'Contrat de travail', icon: 'briefcase' },
  ];

  const pickDocument = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const newDoc: UploadedDocument = {
        type: documentType,
        name: file.name,
        uri: file.uri,
        uploading: true,
        uploaded: false
      };

      setDocuments(prev => [...prev, newDoc]);

      // Upload to backend
      await uploadDocument(newDoc, file);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }
  };

  const uploadDocument = async (doc: UploadedDocument, file: any) => {
    try {
      // Simulate upload - Replace with actual upload logic
      const uploadedDoc = await bookingService.uploadDocument({
        reservationId,
        documentType: doc.type,
        documentUrl: file.uri, // In production, upload to cloud storage first
        uploadedBy: 'current-user-id' // Replace with actual user ID
      });

      setDocuments(prev =>
        prev.map(d =>
          d.uri === doc.uri
            ? { ...d, id: uploadedDoc.id, uploading: false, uploaded: true }
            : d
        )
      );

      // Notify parent component
      const uploadedIds = documents
        .filter(d => d.uploaded)
        .map(d => d.id!)
        .concat(uploadedDoc.id);

      onDocumentsUploaded(uploadedIds);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setDocuments(prev =>
        prev.map(d =>
          d.uri === doc.uri
            ? { ...d, uploading: false, error: error.message }
            : d
        )
      );
      Alert.alert('Erreur', 'Échec du téléchargement du document');
    }
  };

  const removeDocument = (uri: string) => {
    setDocuments(prev => prev.filter(d => d.uri !== uri));
  };

  const isDocumentTypeUploaded = (type: string) => {
    return documents.some(d => d.type === type && d.uploaded);
  };

  const allRequiredDocumentsUploaded = () => {
    return REQUIRED_DOCUMENTS.every(reqDoc =>
      documents.some(d => d.type === reqDoc.type && d.uploaded)
    );
  };

  const renderDocumentItem = (doc: UploadedDocument) => (
    <View
      key={doc.uri}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.surface,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: doc.uploaded ? theme.success : theme.outline + '30'
      }}
    >
      <MaterialCommunityIcons
        name={doc.uploaded ? 'check-circle' : doc.uploading ? 'loading' : 'file-document'}
        size={24}
        color={doc.uploaded ? theme.success : doc.uploading ? theme.primary : theme.onSurface}
        style={{ marginRight: 12 }}
      />

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: '600' }}>{doc.name}</ThemedText>
        <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>
          {REQUIRED_DOCUMENTS.find(rd => rd.type === doc.type)?.label || doc.type}
        </ThemedText>
        {doc.error && (
          <ThemedText style={{ fontSize: 12, color: theme.error }}>
            {doc.error}
          </ThemedText>
        )}
      </View>

      {doc.uploading && <ActivityIndicator size="small" color={theme.primary} />}

      {!doc.uploading && (
        <TouchableOpacity onPress={() => removeDocument(doc.uri)}>
          <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderValidationStatus = () => {
    if (validationStatus === 'pending') {
      return (
        <ThemedView style={{
          padding: 16,
          backgroundColor: theme.warning + '20',
          borderRadius: 12,
          marginTop: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.warning} />
            <ThemedText style={{ marginLeft: 12, flex: 1, color: theme.warning }}>
              En attente de validation par le propriétaire
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (validationStatus === 'approved') {
      return (
        <ThemedView style={{
          padding: 16,
          backgroundColor: theme.success + '20',
          borderRadius: 12,
          marginTop: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
            <ThemedText style={{ marginLeft: 12, flex: 1, color: theme.success }}>
              Documents approuvés par le propriétaire ✓
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (validationStatus === 'rejected') {
      return (
        <ThemedView style={{
          padding: 16,
          backgroundColor: theme.error + '20',
          borderRadius: 12,
          marginTop: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ color: theme.error, fontWeight: '600' }}>
                Documents rejetés
              </ThemedText>
              {rejectionReason && (
                <ThemedText style={{ color: theme.error, marginTop: 4 }}>
                  Raison: {rejectionReason}
                </ThemedText>
              )}
            </View>
          </View>
        </ThemedView>
      );
    }
  };

  return (
    <ThemedView style={{ marginTop: 24 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        Documents requis {required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
      </ThemedText>

      <ThemedText style={{ marginBottom: 16, color: theme.onSurface + '70' }}>
        Veuillez télécharger les documents suivants pour compléter votre réservation
      </ThemedText>

      {/* Required documents list */}
      {REQUIRED_DOCUMENTS.map(reqDoc => (
        <TouchableOpacity
          key={reqDoc.type}
          onPress={() => pickDocument(reqDoc.type)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDocumentTypeUploaded(reqDoc.type)
              ? theme.success + '10'
              : theme.surfaceVariant,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: isDocumentTypeUploaded(reqDoc.type)
              ? theme.success
              : theme.outline + '30'
          }}
        >
          <MaterialCommunityIcons
            name={reqDoc.icon as any}
            size={28}
            color={isDocumentTypeUploaded(reqDoc.type) ? theme.success : theme.primary}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText style={{ fontWeight: '600' }}>{reqDoc.label}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>
              {isDocumentTypeUploaded(reqDoc.type) ? 'Téléchargé ✓' : 'Cliquez pour télécharger'}
            </ThemedText>
          </View>
          <MaterialCommunityIcons
            name={isDocumentTypeUploaded(reqDoc.type) ? 'check-circle' : 'upload'}
            size={24}
            color={isDocumentTypeUploaded(reqDoc.type) ? theme.success : theme.primary}
          />
        </TouchableOpacity>
      ))}

      {/* Uploaded documents */}
      {documents.length > 0 && (
        <ThemedView style={{ marginTop: 24 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Documents téléchargés ({documents.filter(d => d.uploaded).length}/{documents.length})
          </ThemedText>
          {documents.map(renderDocumentItem)}
        </ThemedView>
      )}

      {/* Validation status */}
      {documents.some(d => d.uploaded) && renderValidationStatus()}

      {/* Progress indicator */}
      {documents.length > 0 && (
        <ThemedView style={{ marginTop: 16, padding: 12, backgroundColor: theme.surfaceVariant, borderRadius: 8 }}>
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>
            Progression: {documents.filter(d => d.uploaded).length} / {REQUIRED_DOCUMENTS.length} documents requis
          </ThemedText>
          <View style={{
            height: 4,
            backgroundColor: theme.outline + '30',
            borderRadius: 2,
            marginTop: 8,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${(documents.filter(d => d.uploaded).length / REQUIRED_DOCUMENTS.length) * 100}%`,
              backgroundColor: theme.primary
            }} />
          </View>
        </ThemedView>
      )}

      {/* Completion message */}
      {allRequiredDocumentsUploaded() && validationStatus === 'pending' && (
        <ThemedView style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: theme.primary + '10',
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: theme.primary
        }}>
          <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>
            ✓ Tous les documents requis ont été téléchargés
          </ThemedText>
          <ThemedText style={{ color: theme.primary, marginTop: 4 }}>
            En attente de validation par le propriétaire...
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default DocumentUploadSection;
