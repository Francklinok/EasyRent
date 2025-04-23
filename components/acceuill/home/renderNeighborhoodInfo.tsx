const renderNeighborhoodInfo = (item: ExtendedItemType) => (
    <ThemedView 
      className=" flex-row justify-between items-center p-1 rounded-lg border"
      style={{
        backgroundColor: isDark ? 'rgba(55, 65, 81, 0.2)' : 'rgba(243, 244, 246, 0.6)',
        borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
      }}
    >
      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="school" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.schools}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="hospital" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.healthcare}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="shopping-cart" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.shopping}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="train" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.transport}km
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
