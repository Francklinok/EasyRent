import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomButton, CustomInput, DatePicker, PropertyCard } from '../../components/ui';
import { Property } from '@/types/property';
import { useRoute } from '@react-navigation/native';

// Données d'essai pour remplacer les données du backend
const MOCK_USER = {
  uid: 'user123',
  fullName: 'Jean Dupont'
};  

const ReservationScreen = () => {
  const route = useRoute();

  const { property } = route.params as { property: Property };
  // const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    startDate: Yup.date().required('Date de début requise'),
    endDate: Yup.date().min(
      Yup.ref('startDate'),
      'La date de fin doit être après la date de début'
    ).required('Date de fin requise'),
    numberOfOccupants: Yup.number()
      .min(1, 'Au moins 1 occupant requis')
      .max(property.maxOccupants, `Maximum ${property.maxOccupants} occupants`)
      .required('Nombre d\'occupants requis'),
    hasGuarantor: Yup.boolean(),
    monthlyIncome: Yup.number()
      .min(property.monthlyRent * 2, 'Le revenu doit être au moins le double du loyer')
      .required('Revenu mensuel requis'),
  });

  const formik = useFormik({
    initialValues: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      numberOfOccupants: 1,
      hasGuarantor: false,
      monthlyIncome: 0,
    },
    validationSchema,
    
    onSubmit: (values) => {
      try {
        setLoading(true);
        
        // Simuler l'envoi des données au backend
        setTimeout(() => {
          console.log('Données de réservation:', {
            propertyId: property.id,
            propertyTitle: property.title,
            tenantId: MOCK_USER.uid,
            tenantName: MOCK_USER.fullName,
            landlordId: property.ownerId,
            startDate: values.startDate,
            endDate: values.endDate,
            numberOfOccupants: values.numberOfOccupants,
            hasGuarantor: values.hasGuarantor,
            monthlyIncome: values.monthlyIncome,
            monthlyRent: property.monthlyRent,
            status: 'pending',
            createdAt: new Date(),
            documentsSubmitted: false,
          });
          
          // Simuler la redirection vers l'écran de téléchargement de documents
          // navigation.navigate('DocumentUpload', { 
          //   reservationId: 'mock-reservation-id-123',
          //   property
          // });
          
          setLoading(false);
        }, 1500); // Simuler un délai réseau de 1,5 seconde
        
      } catch (error) {
        console.error('Erreur de simulation:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission de votre réservation.');
        setLoading(false);
      }
    },
  });

  const calculateTotalAmount = () => {
    return property.monthlyRent + property.depositAmount;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Réserver un logement</Text>
        <PropertyCard property={property} />
        
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-4">Détails de la réservation</Text>
          
          <View className="mb-4">
            <Text className="mb-2 font-medium">Date de début</Text>
            <DatePicker
              date={formik.values.startDate}
              onDateChange={(date) => formik.setFieldValue('startDate', date)}
              minimumDate={new Date()}
            />
            {formik.errors.startDate && formik.touched.startDate && (
              // <Text className="text-red-500">{formik.errors.startDate}</Text>
              <Text className="text-red-500">8h20min</Text>

            )}
          </View>
          
          <View className="mb-4">
            <Text className="mb-2 font-medium">Date de fin</Text>
            <DatePicker
              date={formik.values.endDate}
              onDateChange={(date) => formik.setFieldValue('endDate', date)}
              minimumDate={formik.values.startDate}
            />
            {formik.errors.endDate && formik.touched.endDate && (
              // <Text className="text-red-500">{formik.errors.endDate}</Text>
              <Text className="text-red-500">10h:32min</Text>

            )}
          </View>
          
          <CustomInput
            label="Nombre d'occupants"
            placeholder="Nombre d'occupants"
            keyboardType="numeric"
            value={formik.values.numberOfOccupants.toString()}
            onChangeText={(value) => formik.setFieldValue('numberOfOccupants', parseInt(value) || 0)}
            error={formik.touched.numberOfOccupants ? formik.errors.numberOfOccupants : undefined}
          />
          
          <CustomInput
            label="Revenu mensuel (€)"
            placeholder="Votre revenu mensuel"
            keyboardType="numeric"
            value={formik.values.monthlyIncome.toString()}
            onChangeText={(value) => formik.setFieldValue('monthlyIncome', parseInt(value) || 0)}
            error={formik.touched.monthlyIncome ? formik.errors.monthlyIncome : undefined}
          />
          
          <View className="flex-row items-center mb-4">
            <Text className="font-medium flex-1">Avez-vous un garant?</Text>
            <CustomButton
              title={formik.values.hasGuarantor ? "Oui" : "Non"}
              onPress={() => formik.setFieldValue('hasGuarantor', !formik.values.hasGuarantor)}
              type={formik.values.hasGuarantor ? "primary" : "outline"}
              className="w-20"
            />
          </View>
          
          <View className="bg-gray-50 p-4 rounded-lg my-4">
            <Text className="text-lg font-semibold mb-2">Résumé des coûts</Text>
            <View className="flex-row justify-between mb-2">
              <Text>Loyer mensuel</Text>
              <Text>{property.monthlyRent} €</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text>Dépôt de garantie</Text>
              <Text>{property.depositAmount} €</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-2">
              <Text className="font-bold">Total à payer</Text>
              <Text className="font-bold">{calculateTotalAmount()} €</Text>
            </View>
          </View>
          
          <Text className="mb-4 text-sm text-gray-600">
            En cliquant sur "Continuer", vous acceptez de soumettre votre dossier pour vérification.
            Vous devrez télécharger les documents nécessaires à l'étape suivante.
          </Text>
          
          <CustomButton
            title="Continuer vers les documents"
            onPress={formik.handleSubmit}
            loading={loading}
            disabled={!formik.isValid || loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReservationScreen;


