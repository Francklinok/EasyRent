// Filter modal
  const renderFilterModal = () => {
    if (!filterModalVisible) return null;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 40,
          transform: [
            { translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0]
            })}
          ]
        }}
      >
        <BlurView 
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          className="rounded-t-3xl overflow-hidden border-t border-x"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <ThemedView className="p-2">
            <ThemedView className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-bold">Filtres</ThemedText>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="p-2"
              >
                <AntDesign name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </ThemedView>
            
            {/* Price Range */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Prix</ThemedText>
              <ThemedView className="h-2 bg-gray-300 rounded-full">
                <ThemedView 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: '60%', 
                    backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                  }} 
                />
              </ThemedView>
              <ThemedView className="flex-row justify-between mt-1">
                <ThemedText className="text-xs">$0</ThemedText>
                <ThemedText className="text-xs">$5,000,000</ThemedText>
              </ThemedView>
            </ThemedView>
            
            {/* Property Type */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Type de propriété</ThemedText>
              <ThemedView className="flex-row flex-wrap gap-2">
                {['Maison', 'Appartement', 'Villa', 'Terrain'].map((type, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`px-3 py-2 rounded-lg border ${
                      idx === 0 ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: idx === 0 ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: idx === 0 ? '600' : '400'
                      }}
                    >
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Bedrooms */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Chambres</ThemedText>
              <ThemedView className="flex-row gap-2">
                {[1, 2, 3, 4, '5+'].map((num, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                      idx === 1 ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: idx === 1 ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: idx === 1 ? '600' : '400'
                      }}
                    >
                      {num}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Amenities */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Équipements</ThemedText>
              <ThemedView className="flex-row flex-wrap gap-2">
                {['Piscine', 'Parking', 'Jardin', 'Sécurité', 'Wi-Fi', 'Climatisation'].map((amenity, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`px-3 py-2 rounded-lg border flex-row items-center gap-1 ${
                      [0, 2, 5].includes(idx) ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <FontAwesome5 
                      name={
                        idx === 0 ? 'swimming-pool' : 
                        idx === 1 ? 'parking' : 
                        idx === 2 ? 'tree' : 
                        idx === 3 ? 'shield-alt' : 
                        idx === 4 ? 'wifi' : 'snowflake'
                      } 
                      size={14} 
                      color={[0, 2, 5].includes(idx) ? 
                        (isDark ? '#93c5fd' : '#2563eb') : colors.subtext
                      } 
                    />
                    <ThemedText 
                      style={{ 
                        color: [0, 2, 5].includes(idx) ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: [0, 2, 5].includes(idx) ? '600' : '400'
                      }}
                    >
                      {amenity}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Action Buttons */}
            <ThemedView className="flex-row gap-3 mt-4">
              <TouchableOpacity 
                className="flex-1 py-3 border rounded-xl"
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }}
                onPress={() => setFilterModalVisible(false)}
              >
                <ThemedText className="text-center font-semibold">Réinitialiser</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                }}
                onPress={() => setFilterModalVisible(false)}
              >
                <ThemedText className="text-center font-semibold text-white">Appliquer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </BlurView>
      </Animated.View>
    );
  };