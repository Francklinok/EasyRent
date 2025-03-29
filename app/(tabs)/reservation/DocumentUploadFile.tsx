
// Fichier: screens/DocumentUploadScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { storage, firestore } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { CustomButton } from '../components';
import { Property } from '../types';

const requiredDocuments = [
  { id: 'idCard', name: 'Pièce d\'identité', required: true },
  { id: 'proofOfIncome', name: 'Justificatif de revenus', required: true },
  { id: 'proofOfAddress', name: 'Justificatif de domicile', required: true },
  { id: 'taxReturn', name: 'Dernier avis d\'imposition', required: true },
  { id: 'employmentContract', name: 'Contrat de travail', required: true },
  { id: 'guarantorDocuments', name: 'Documents du garant', required: false },
];

export default function DocumentUploadScreen({ route }) {
  const { reservationId, property } = route.params as { reservationId: string, property: Property };
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [documents, setDocuments] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservationDoc = await getDoc(doc(firestore, 'reservations', reservationId));
        if (reservationDoc.exists()) {
          setReservation(reservationDoc.data());
          if (reservationDoc.data().documents) {
            setDocuments(reservationDoc.data().documents);
          }
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
      }
    };

    fetchReservation();
  }, [reservationId]);

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
      const response = await fetch(file.uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `documents/${user.uid}/${reservationId}/${docId}_${Date.now()}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      setDocuments(prev => ({
        ...prev,
        [docId]: downloadURL,
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
        .filter(doc => doc.required && !documents[doc.id])
        .map(doc => doc.name);
      
      if (missingRequiredDocs.length > 0) {
        Alert.alert(
          'Documents manquants',
          `Veuillez télécharger les documents suivants: ${missingRequiredDocs.join(', ')}`
        );
        setLoading(false);
        return;
      }
      
      // Mettre à jour la réservation avec les documents
      await updateDoc(doc(firestore, 'reservations', reservationId), {
        documents,
        documentsSubmitted: true,
        documentSubmissionDate: new Date().toISOString(),
        status: 'documents_submitted',
      });
      
      Alert.alert(
        'Documents soumis',
        'Vos documents ont été soumis avec succès. Vous serez notifié lorsque le propriétaire aura examiné votre dossier.',
        [
          { text: 'OK', onPress: () => navigation.navigate('ReservationStatus') }
        ]
      );
    } catch (error) {
      console.error('Document submission error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission de vos documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Documents requis</Text>
        
        <Text className="mb-4 text-gray-700">
          Veuillez télécharger les documents suivants pour compléter votre demande de réservation.
          Tous les documents marqués comme requis (*) doivent être fournis.
        </Text>
        
        <View className="mb-6">
          {requiredDocuments.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              onPress={() => pickDocument(doc.id)}
              className={`flex-row items-center p-4 border rounded-lg mb-3 ${
                documents[doc.id] ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
            >
              <View className="flex-1">
                <Text className="font-medium">
                  {doc.name} {doc.required && <Text className="text-red-500">*</Text>}
                </Text>
                {documents[doc.id] ? (
                  <Text className="text-green-600 text-sm">Document téléchargé</Text>
                ) : (
                  <Text className="text-gray-500 text-sm">Cliquez pour télécharger</Text>
                )}
              </View>
              
              {uploading === doc.id ? (
                <View className="h-6 w-6 items-center justify-center">
                  <Text>...</Text>
                </View>
              ) : documents[doc.id] ? (
                <Ionicons name="checkmark-circle" size={24} color="green" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color="gray" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <CustomButton
          title="Soumettre les documents"
          onPress={submitDocuments}
          loading={loading}
          disabled={loading || uploading !== null}
        />
        
        <TouchableOpacity 
          className="mt-4 items-center"
          onPress={() => navigation.navigate('ReservationStatus')}
        >
          <Text className="text-blue-500">Enregistrer et continuer plus tard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
