// TelemedicineScreen.js
import React from 'react';
import { View, Text } from 'react-native';

const TelemedicineScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-200 p-6">
      <Text className="text-xl font-bold">Téléconsultation Médicale</Text>
      <Text className="mt-4 text-gray-700">
        Accède à une consultation médicale à distance avec un médecin disponible 24/7.
      </Text>
    </View>
  );
};

export default TelemedicineScreen;
