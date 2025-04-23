
  const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing' }}
      className="mb-6 px-1"
    >
      <Animatable.View
        animation={animatingElement === item.id ? "pulse" : undefined}
        duration={500}
      >
        <ThemedView 
          elevated="medium"
          className="rounded-3xl overflow-hidden"
        >
          <BlurView 
            intensity={isDark ? 20 : 70} 
            tint={isDark ? "dark" : "light"} 
            className={`border rounded-3xl overflow-hidden ${
              isDark ? "border-white/10" : "border-black/5"
            }`}
          >
            <LinearGradient
              colors={colors.cardGradient}
              className="overflow-hidden"
            >
              {/* Image Section with Overlay */}
              <ThemedView className="relative">
                <MotiView id={`item.${item.id}.image`}>
                  <Image 
                    source={item.avatar} 
                    className="w-full h-80" 
                    resizeMode="cover" 
                  />
                </MotiView>
                <LinearGradient
                  colors={isDark 
                    ? ["transparent", "rgba(20,20,40,0.5)", "rgba(10,10,30,0.9)"] 
                    : ["transparent", "rgba(20,20,20,0.2)", "rgba(10,10,10,0.1)"]
                  }
                  className="absolute bottom-0 left-0 right-0 h-3/4"
                />
                
                {/* Status Indicators and Badges */}
                <ThemedView 
                  className="absolute top-3 left-1 right-4 flex-row justify-between items-center"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <ThemedView 
                    className="px-2 py-1 rounded-full flex-row items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <ThemedView 
                      className="h-2 w-2 rounded-full relative"
                      style={{ 
                        backgroundColor: item.availibility === "available" ? '#34d399' : '#ef4444',
                      }}
                    >
                      {item.availibility === "available" && (
                        <Animated.View 
                          className="absolute h-2 w-2 rounded-full bg-green-400/50"
                          style={{
                            transform: [{ scale: pulseAnim }]
                          }}
                        />
                      )}
                    </ThemedView>
                    <ThemedText 
                      style={{ 
                        fontWeight: '600',
                        color: item.availibility === "available" ? '#34d399' : '#ef4444', 
                        fontSize: 10,
                        marginLeft: 2,
                      }}
                    >
                      {item.availibility === "available" ? "Disponible" : "Indisponible"}
                    </ThemedText>
                  </ThemedView>
                  
                  {/* Render energy score */}
                  {renderEnergyScore(item.energyScore)}

                  {/* Render virtual tour badge */}
                  {renderVirtualTourBadge(item.virtualTourAvailable)}
                  
                  <TouchableOpacity 
                    className={`p-3 rounded-full border ${
                      isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-white/50 border-gray-200/50"
                    }`}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    {favorites.includes(item.id) ? (
                      <LottieView
                        ref={lottieRef}
                        source={require("@/assets/animations/heart.json")}
                        style={{ width: 20, height: 20 }}
                        autoPlay={false}
                        loop={false}
                      />
                    ) : (
                      <Ionicons 
                        name="heart-outline" 
                        size={20} 
                        color={isDark ? "#ffffff" : "#3b82f6"} 
                      />
                    )}
                  </TouchableOpacity>
                </ThemedView>

                {/* Feature Icons - now with smooth animation */}
                <ThemedView 
                  className="absolute bottom-4 left-4 flex-row gap-2"
                  style={{ backgroundColor: "transparent" }}
                >
                  {item.features?.map((feature, idx) => (
                    <MotiView
                      key={idx}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: idx * 100 + 300, type: 'spring' }}
                    >
                      <ThemedView 
                        className="p-1 rounded-lg border"
                        style={{
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                          borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
                        }}
                      >
                        <FontAwesome5 name={feature.icon} size={16} color={colors.subtext} />
                      </ThemedView>
                    </MotiView>
                  ))}
                </ThemedView>

                {/* Price Tag with enhanced styling */}
                <ThemedView className="absolute p-2 rounded-3xl bottom-4 right-4"
                 style={{ 
                  backgroundColor: isDark ? 'rgba(30, 64, 175, 0.7)' : 'rgba(219, 234, 254, 0.9)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.2)',
                }}
                  >
                    <ThemedText className="text-white font-bold text-lg">
                      {item.price}
                    </ThemedText>
                  {/* </LinearGradient> */}
                </ThemedView>
              </ThemedView>

              {/* Content Section */}
              <ThemedView className=" pl-4 pr-4 gap-2">
                {/* Location and Rating */}
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedView className="flex-row items-center gap-2">
                    <MaterialIcons name="location-on" size={18} color={colors.subtext} />
                    <ThemedText className="text-base font-semibold"
                      style={{ fontSize: 14 }}>
                      {item.location}
                    </ThemedText>
                  </ThemedView>

                <ThemedView className="flex-row justify-center flex-wrap gap-2 my-1">
                  <ThemedView 
                    className={`px-2 py-1 rounded-lg border ${
                      isDark 
                        ? "bg-violet-500/20 border-violet-500/30" 
                        : "bg-violet-100 border-violet-200"
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: isDark ? 'rgba(196, 181, 253, 1)' : 'rgba(109, 40, 217, 1)', 
                        fontWeight: '600', 
                        fontSize: 9
                      }}
                    >
                      AI MANAGED
                    </ThemedText>
                  </ThemedView>
                  <ThemedView 
                    className={`px-2 py-1 rounded-lg border ${
                      isDark 
                        ? "bg-blue-500/20 border-blue-500/30" 
                        : "bg-blue-100 border-blue-200"
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: isDark ? 'rgba(147, 197, 253, 1)' : 'rgba(29, 78, 216, 1)', 
                        fontWeight: '600', 
                        fontSize: 9 
                      }}
                    >
                      NEURAL CONTROLS
                    </ThemedText>
                  </ThemedView>
                
                </ThemedView>
                  <ThemedView 
                    className={`flex-row items-center gap-1 px-3 py-1 rounded-lg border ${
                      isDark ? "bg-gray-800/40 border-gray-700/30" : "bg-white/70 border-gray-200/60"
                    }`}
                  >
                    <FontAwesome5 name="star" size={16} color="#fcd34d" />
                    <ThemedText className="text-lg font-bold">
                      {item.stars}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
