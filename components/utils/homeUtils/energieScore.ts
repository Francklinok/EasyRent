// Generate energy score for each property
const getEnergyScore = (location: string): number => {
    const baseScore = Math.floor(Math.random() * 40) + 60; // Between 60-100
    
    // Location-specific adjustments
    switch (location) {
      case "California":
        return Math.min(100, baseScore + 15); // California has better energy scores
      case "Texas":
        return Math.max(60, baseScore - 10); // Texas has worse energy scores
      default:
        return baseScore;
    }
  };
  export  default getEnergyScore;