import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';

type ServicesProps = {
  itemData?: {
    services?: {
      key: string;
      title: string;
      description: string;
      icon: string;
      available?: boolean;
    }[];
  };
};

const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const scaleValue = new Animated.Value(1);
  const  {theme} = useTheme()

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 150,
      friction: 7,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 7,
    }).start();
  };

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: scaleValue }],
        marginBottom: 11,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        // className=" rounded-2xl"
        // style={{
        //   shadowColor: theme.shadow,
        //   shadowOffset: { width: 0, height: 4 },
        //   shadowOpacity: 0.1,
        //   shadowRadius: 12,
        //   elevation: 0,
        // }}
      >
        <ThemedView variant = "surfaceVariant" className="p-3 flex-row gap-4 items-center rounded-1xl">
          {/* Icon avec gradient background */}
          <ThemedView  
            className="rounded-2xl mr-2"
            style={{
              backgroundColor: theme.primary,
              padding: 14,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1,
            }}>
            <MaterialCommunityIcons
              name={service.icon}
              size={24}
              color= {theme.surface}
            />
          </ThemedView>

          {/* Content */}
          <ThemedView variant = "surfaceVariant" className="flex-1">
            <ThemedText type = "body" className = "pb-2">
              {service.title}
            </ThemedText>
            <ThemedText >
              {service.description}
            </ThemedText>
          </ThemedView>

          {/* Arrow indicator */}
          <ThemedView 
            className="rounded-full p-2 ml-3"
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.onSurface}
            />
          </ThemedView>
        </ThemedView>

        {/* Subtle bottom accent */}
        <ThemedView 
          className="h-1 rounded-b-2xl"
          style={{
            backgroundColor: '#4A90E2',
            opacity: 0.1,
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => (
  <ThemedView className="flex-1 justify-center items-center px-6 py-20 ">
    {/* Icon avec animation */}
    <ThemedView 
      className="rounded-full p-8 mb-6"
      style={{
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
      }}
    >
      <MaterialCommunityIcons
        name="cog-outline"
        size={64}
        color="#CBD5E0"
      />
    </ThemedView>

    {/* Title */}
    <ThemedText 
      className="text-2xl font-bold text-center mb-3"
      style={{ color: '#1A202C' }}
    >
      Aucun service disponible
    </ThemedText>

    {/* Description */}
    <ThemedText 
      className="text-center text-base leading-6 mb-8 max-w-sm"
      style={{ color: '#718096' }}
    >
      Vous pourrez souscrire aux services dans votre{" "}
      <ThemedText 
        type="body" 
        intensity="strong"
        style={{ color: '#4A90E2' }}
      >
        profil
      </ThemedText>
      {" "}une fois votre location confirmée
    </ThemedText>

    {/* CTA Button */}
    <TouchableOpacity
      className="rounded-xl px-8 py-4"
      style={{
        backgroundColor: '#4A90E2',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <ThemedText 
      >
        Découvrir les services
      </ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const Services = ({ itemData }: ServicesProps) => {
  // On filtre les services disponibles (available === true)
  const availableServices = itemData?.services?.filter(service => service.available) || [];

  if (availableServices.length === 0) {
    return <EmptyState />;
  }

  return (
    <ThemedView className="flex-1">
      <ThemedView 
        className="px-6 pt-6 pb-4 "
        style={{
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <ThemedText type = "subtitle"
          className=" mb-2  text-center"
        >
          Services disponibles
        </ThemedText>
        <ThemedText className = "text-center"
        >
          {availableServices.length} service{availableServices.length > 1 ? 's' : ''} à votre disposition
        </ThemedText>
      </ThemedView>

      {/* Services List */}
      <ScrollView 
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {availableServices.map((service, index) => (
          <ServiceCard 
            key={service.key} 
            service={service} 
            index={index} 
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

export default Services;