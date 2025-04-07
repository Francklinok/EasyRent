import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";

const BuyerProfile = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView className="space-y-6">
        <Text className="text-2xl font-bold text-gray-900 mt-4">Profil de l'acheteur potentiel</Text>

        <View className="space-y-4">
          <Input label="Nom complet" placeholder="Ex: Jean Dupont" />
          <Input label="Email" placeholder="Ex: jean.dupont@email.com" keyboardType="email-address" />
          <Input label="Numéro de téléphone" placeholder="Ex: +33 6 12 34 56 78" keyboardType="phone-pad" />
        </View>

        <View className="space-y-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800">Type de bien recherché</Text>
          <Select label="Type de bien">
            <SelectItem label="Maison" value="maison" />
            <SelectItem label="Terrain" value="terrain" />
            <SelectItem label="Appartement" value="appartement" />
            <SelectItem label="Autre" value="autre" />
          </Select>

          <Input label="Localisation souhaitée" placeholder="Ex: Dakar, Thiès..." />

          <View className="flex-row space-x-4">
            <Input label="Budget min (€)" keyboardType="numeric" className="flex-1" />
            <Input label="Budget max (€)" keyboardType="numeric" className="flex-1" />
          </View>

          <Input
            label="Superficie minimale (m²)"
            placeholder="Ex: 100"
            keyboardType="numeric"
          />

          <Input
            label="Nombre de chambres minimum"
            placeholder="Ex: 3"
            keyboardType="numeric"
          />
        </View>

        <View className="space-y-2 mt-6">
          <Text className="text-lg font-semibold text-gray-800">Autres critères ou préférences</Text>
          <Input
            multiline
            numberOfLines={4}
            placeholder="Ex: Proximité d'une école, vue mer, quartier calme..."
            className="h-24 text-start"
          />
        </View>

        <Button className="mt-6 bg-blue-600 text-white rounded-2xl py-3">
          Enregistrer le profil
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyerProfile;
