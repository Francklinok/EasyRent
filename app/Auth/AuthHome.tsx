import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const HOUSE_IMAGE = require('@/assets/images/property.jpg') as number;

const { width, height } = Dimensions.get('window');

const AuthHome = () => {
  const router = useRouter();

  // Countdown timer 
  const [seconds, setSeconds] = useState(183); // 3:03
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Top half: full-bleed house photo ── */}
      <View style={styles.imageContainer}>
        <Image source={HOUSE_IMAGE} style={styles.heroImage} resizeMode="cover" />

        {/* Timer badge — top right */}
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>

        {/* Subtle bottom fade so white card blends in */}
        <View style={styles.imageFade} />
      </View>

      {/* ── Bottom half: white card ── */}
      <View style={styles.card}>
        <Text style={styles.title}>Find your{'\n'}sweet home</Text>
        <Text style={styles.subtitle}>
          Schedule visits in just a few clicks,{'\n'}visits in just a few clicks
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },

  // ── Image ──────────────────────────────────────────────────────────────
  imageContainer: {
    width,
    height: height * 0.58,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  timerBadge: {
    position: 'absolute',
    top: 46,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  imageFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    lineHeight: 22,
    marginTop: 10,
    flex: 1,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 32,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default AuthHome;
