import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/components/contexts/authContext/AuthContext';

const { width, height } = Dimensions.get('window');

const AuthHome = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const getFirstName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    return 'Utilisateur';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        {/* Floating Background Elements */}
        <View style={styles.floatingElements}>
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle1,
              {
                transform: [{
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20]
                  })
                }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle2,
              {
                transform: [{
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15]
                  })
                }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle3,
              {
                transform: [{
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10]
                  })
                }]
              }
            ]} 
          />
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <BlurView intensity={15} style={styles.welcomeCard}>
            {/* Welcome Header */}
            <View style={styles.header}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              <Text style={styles.welcomeTitle}>Bienvenue, {getFirstName()}!</Text>
              <Text style={styles.welcomeSubtitle}>
                Connexion réussie
              </Text>
            </View>

            {/* App Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Découvrez votre nouvelle expérience</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="home" size={24} color="#667eea" />
                  <Text style={styles.featureText}>Trouvez votre propriété idéale</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="heart" size={24} color="#f5576c" />
                  <Text style={styles.featureText}>Sauvegardez vos favoris</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="wallet" size={24} color="#4facfe" />
                  <Text style={styles.featureText}>Gérez vos paiements</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="chatbubbles" size={24} color="#f093fb" />
                  <Text style={styles.featureText}>Communiquez facilement</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              onPress={handleGetStarted}
              style={styles.getStartedButton}
            >
              <LinearGradient 
                colors={['#667eea', '#764ba2']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Commencer l'exploration</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>
                Une plateforme complète pour tous vos besoins immobiliers
              </Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Bottom Decoration */}
        <View style={styles.bottomDecoration}>
          <Animated.View 
            style={[
              styles.decorationDot,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.decorationDot,
              styles.decorationDot2,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.decorationDot,
              styles.decorationDot3,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 100,
    height: 100,
    top: 100,
    left: 30,
  },
  circle2: {
    width: 60,
    height: 60,
    top: 200,
    right: 50,
  },
  circle3: {
    width: 80,
    height: 80,
    bottom: 150,
    left: 50,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  welcomeCard: {
    width: '100%',
    borderRadius: 30,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
    fontWeight: '500',
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: 10,
  },
  decorationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  decorationDot2: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  decorationDot3: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default AuthHome;