/ INNOVATION 1: Carte de recommandation IA personnalisée
  const renderAIRecommendation = () => {
    if (!showAIRecommendations) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 300 }}
        className="mx-2 mb-6"
      >
        <TouchableOpacity
          onPress={() => setShowAIRecommendations(false)}
          activeOpacity={0.9}
        >
          <BlurView
            intensity={isDark ? 30 : 70}
            tint={isDark ? "dark" : "light"}
            className="rounded-3xl overflow-hidden border"
            style={{ borderColor: isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(37, 99, 235, 0.2)' }}
          >
            <LinearGradient
              colors={isDark 
                ? ['rgba(30, 58, 138, 0.4)', 'rgba(37, 99, 235, 0.1)'] 
                : ['rgba(219, 234, 254, 0.8)', 'rgba(191, 219, 254, 0.4)']}
              className="px-4 py-4"
            >
              <ThemedView className="flex-row items-center gap-3" style={{ backgroundColor: 'transparent' }}>
                <ThemedView 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.1)' }}
                >
                  <MaterialCommunityIcons name="robot-excited" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
                </ThemedView>
                <ThemedView style={{ backgroundColor: 'transparent' }}>
                  <ThemedText style={{ fontWeight: '700', color: isDark ? "#60a5fa" : "#2563eb" }}>
                    Assistant RenHome AI
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: isDark ? "#93c5fd" : "#3b82f6" }}>
                    Recommandations personnalisées
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView 
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : 'rgba(239, 246, 255, 0.8)' }}
              >
                <ThemedText className="leading-5" style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}>
                  Basé sur vos préférences, nous avons sélectionné 3 propriétés qui correspondent à vos critères. 
                  Notre analyse IA suggère que la propriété à "California" correspond le mieux à votre style de vie.
                </ThemedText>
              </ThemedView>

              <ThemedView className="mt-3 flex-row justify-between" style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <ThemedText style={{ color: isDark ? "#93c5fd" : "#2563eb", fontWeight: '600', fontSize: 12 }}>
                    Voir les suggestions
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.8)',
                  }}
                >
                  <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                    Affiner mes critères
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </MotiView>
    );
  };