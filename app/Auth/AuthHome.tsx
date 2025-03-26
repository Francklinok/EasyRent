import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
   
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Types pour la gestion des utilisateurs
interface User {
  email: string;
  password: string;
  username?: string;
}

// Écran d'accueil initial
const WelcomeScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push({
      pathname:"/Auth/Register."
    });

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#4A90E2', '#63A4FF']}
        className="flex-1 items-center justify-center"
      >
        <View className="items-center">
          <Image 
            // source={require('@/assets/welcome-illustration.png')} 
            className="w-80 h-80 mb-10"
            resizeMode="contain"
          />
          <Text className="text-4xl font-bold text-white mb-6">
            Bienvenue
          </Text>
          <Text className="text-lg text-white text-center px-10 mb-12">
            Découvrez une expérience unique qui simplifie votre vie quotidienne
          </Text>
          
          <TouchableOpacity 
            onPress={handleGetStarted}
            className="bg-white px-20 py-4 rounded-full shadow-lg"
          >
            <Text className="text-[#4A90E2] font-bold text-lg">
              Commencer
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
};
 
export default WelcomeScreen; 