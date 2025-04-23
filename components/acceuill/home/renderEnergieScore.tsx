  const renderEnergyScore = (score: number) => {
    let color = '#22c55e'; // Green for high scores
    if (score < 70) color = '#f59e0b'; // Yellow for medium scores
    if (score < 60) color = '#ef4444'; // Red for low scores
    
    return (
      <ThemedView 
        className="rounded-lg px-1 py-1 flex-row  gap-1"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)' }}
      >
        <MaterialCommunityIcons name="leaf" size={12} color={color} />
        <ThemedText style={{ color, fontWeight: '600', fontSize: 10 }}>
          {score}
        </ThemedText>
      </ThemedView>
    );
  };
