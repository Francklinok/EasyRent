import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Image } from 'expo-image';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

// Types pour la visite virtuelle
interface VirtualTour {
  id: string;
  title: string;
  description: string;
  points: VirtualTourPoint[];
}

interface VirtualTourPoint {
  id: string;
  title: string;
  description: string;
  panoramaUrl: string;
  roomType: string;
  x: number;
  y: number;
  z: number;
  hotspots: VirtualTourHotspot[];
}

interface VirtualTourHotspot {
  id: string;
  type: 'navigation' | 'info' | 'measurement' | 'feature' | 'furniture';
  x: number;
  y: number;
  targetPointId?: string;
  content: {
    title: string;
    description?: string;
    measurementData?: {
      dimensions: string;
      surface: number;
    };
    furnitureData?: {
      brand: string;
      model: string;
      price?: number;
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VirtualTourViewerProps {
  tour: VirtualTour;
  visible: boolean;
  onClose: () => void;
  onInteraction?: (type: string, data: any) => void;
}

interface VirtualTourControlsProps {
  currentPoint: VirtualTourPoint;
  tour: VirtualTour;
  onNavigate: (pointId: string) => void;
  onToggleFullscreen: () => void;
  onToggleAR: () => void;
  onShare: () => void;
  onClose: () => void;
  isFullscreen: boolean;
  arEnabled: boolean;
}

interface HotspotOverlayProps {
  hotspot: VirtualTourHotspot;
  onPress: (hotspot: VirtualTourHotspot) => void;
  scale: Animated.Value;
}

const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  tour,
  visible,
  onClose,
  onInteraction
}) => {
  const { theme } = useTheme();
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arEnabled, setArEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<VirtualTourHotspot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hotspotScale = useRef(new Animated.Value(1)).current;

  const currentPoint = tour.points[currentPointIndex];

  // Auto-hide controls
  const controlsTimer = useRef<NodeJS.Timeout>();
  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 4000);
  }, [controlsOpacity]);

  // Enhanced AR mode implementation
  const toggleARMode = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!arEnabled) {
        const arConfig = {
          anchors: currentPoint ? [{
            pointId: currentPoint.id,
            worldPosition: { x: currentPoint.x, y: currentPoint.y, z: currentPoint.z },
            qrCode: `ar_anchor_${currentPoint.id}`
          }] : [],
          overlayElements: currentPoint?.hotspots.map(hotspot => ({
            type: hotspot.type === 'furniture' ? 'furniture' :
                  hotspot.type === 'measurement' ? 'measurement' : 'information',
            position: { x: hotspot.x, y: hotspot.y, z: 0 },
            content: hotspot.content
          })) || []
        };

        setArEnabled(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        onInteraction?.('ar_enabled', {
          pointId: currentPoint?.id,
          arConfig
        });
      } else {
        setArEnabled(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        onInteraction?.('ar_disabled', {
          pointId: currentPoint?.id
        });
      }
    } catch (error) {
      console.error('Failed to toggle AR mode:', error);
      Alert.alert('AR Error', 'Failed to enable AR mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [arEnabled, currentPoint, onInteraction]);

  // Enhanced 360° panoramic navigation with improved sensitivity
  const navigate360 = useCallback((deltaX: number, deltaY: number) => {
    const sensitivity = 0.8;
    const maxRotation = 180;

    // Calculate new rotation values
    const newPanX = Math.max(-maxRotation, Math.min(maxRotation, panX._value + deltaX * sensitivity));
    const newPanY = Math.max(-90, Math.min(90, panY._value + deltaY * sensitivity));

    // Apply smooth rotation
    Animated.parallel([
      Animated.spring(panX, {
        toValue: newPanX,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(panY, {
        toValue: newPanY,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start();

    // Track navigation interaction
    onInteraction?.('panorama_navigation', {
      pointId: currentPoint?.id,
      rotation: { x: newPanX, y: newPanY },
      timestamp: Date.now()
    });
  }, [panX, panY, currentPoint, onInteraction]);

  // Enhanced zoom functionality with pinch gestures
  const handleZoom = useCallback((zoomLevel: number) => {
    const minZoom = 0.5;
    const maxZoom = 3.0;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel));

    Animated.spring(scale, {
      toValue: clampedZoom,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();

    onInteraction?.('zoom_change', {
      pointId: currentPoint?.id,
      zoomLevel: clampedZoom,
      timestamp: Date.now()
    });
  }, [scale, currentPoint, onInteraction]);

  // Enhanced pan responder with improved gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        resetControlsTimer();
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        // Enhanced 360° navigation with better sensitivity
        navigate360(gestureState.dx * 0.5, gestureState.dy * 0.3);
      },
      onPanResponderRelease: () => {
        // Smooth deceleration effect
        Animated.decay(panX, {
          velocity: 0,
          deceleration: 0.95,
          useNativeDriver: true,
        }).start();

        Animated.decay(panY, {
          velocity: 0,
          deceleration: 0.95,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Navigate to specific tour point with smooth transition
  const navigateToPoint = useCallback((pointId: string) => {
    const pointIndex = tour.points.findIndex(p => p.id === pointId);
    if (pointIndex !== -1 && pointIndex !== currentPointIndex) {
      setIsLoading(true);

      // Smooth transition animation
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPointIndex(pointIndex);
        setIsLoading(false);
      });

      // Reset rotation and zoom
      Animated.parallel([
        Animated.spring(panX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(panY, { toValue: 0, useNativeDriver: true }),
      ]).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      onInteraction?.('point_navigation', {
        fromPointId: currentPoint?.id,
        toPointId: pointId,
        timestamp: Date.now()
      });
    }
  }, [tour.points, currentPointIndex, currentPoint, scale, panX, panY, onInteraction]);

  // Handle hotspot interactions with enhanced feedback
  const handleHotspotPress = useCallback((hotspot: VirtualTourHotspot) => {
    setSelectedHotspot(hotspot);

    // Animate hotspot selection
    Animated.sequence([
      Animated.timing(hotspotScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(hotspotScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Handle different hotspot types
    switch (hotspot.type) {
      case 'navigation':
        if (hotspot.targetPointId) {
          navigateToPoint(hotspot.targetPointId);
        }
        break;
      case 'info':
        // Show information modal
        break;
      case 'measurement':
        // Show measurement details
        break;
      case 'furniture':
        // Show furniture information
        break;
      default:
        break;
    }

    onInteraction?.('hotspot_interaction', {
      pointId: currentPoint?.id,
      hotspotId: hotspot.id,
      hotspotType: hotspot.type,
      content: hotspot.content,
      timestamp: Date.now()
    });
  }, [hotspotScale, currentPoint, navigateToPoint, onInteraction]);

  // Fullscreen mode toggle with orientation lock
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      } else {
        await ScreenOrientation.unlockAsync();
        setIsFullscreen(false);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      onInteraction?.('fullscreen_toggle', {
        pointId: currentPoint?.id,
        isFullscreen: !isFullscreen,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  }, [isFullscreen, currentPoint, onInteraction]);

  // Enhanced share functionality
  const handleShare = useCallback(() => {
    Alert.alert(
      'Partager la visite',
      'Comment souhaitez-vous partager cette visite virtuelle ?',
      [
        { text: 'Lien direct', onPress: () => onInteraction?.('share', { type: 'link', pointId: currentPoint?.id }) },
        { text: 'Réseaux sociaux', onPress: () => onInteraction?.('share', { type: 'social', pointId: currentPoint?.id }) },
        { text: 'Email', onPress: () => onInteraction?.('share', { type: 'email', pointId: currentPoint?.id }) },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  }, [onInteraction, currentPoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Initialize controls timer
  useEffect(() => {
    if (visible) {
      resetControlsTimer();
      setIsLoading(false);
    }
  }, [visible, resetControlsTimer]);

  // Performance-optimized hotspot overlay component
  const HotspotOverlay =  React.memo(({ hotspot, onPress, scale }: HotspotOverlayProps) => {

    const getHotspotIcon = () => {
      switch (hotspot.type) {
        case 'navigation':
          return 'navigation';
        case 'info':
          return 'information-outline';
        case 'measurement':
          return 'ruler';
        case 'feature':
          return 'star-outline';
        case 'furniture':
          return 'sofa';
        default:
          return 'circle';
      }
    };

    const getHotspotColor = () => {
      switch (hotspot.type) {
        case 'navigation':
          return theme.primary;
        case 'info':
          return theme.secondary;
        case 'measurement':
          return '#FFA500';
        case 'feature':
          return '#2ed573';
        case 'furniture':
          return '#ff4757';
        default:
          return theme.onSurface;
      }
    };

    return (
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        style={{
          position: 'absolute',
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          transform: [{ translateX: -20 }, { translateY: -20 }],
        }}
      >
        <TouchableOpacity
          onPress={() => onPress(hotspot)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: getHotspotColor() + '20',
            borderWidth: 2,
            borderColor: getHotspotColor(),
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: getHotspotColor(),
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <MaterialCommunityIcons
              name={getHotspotIcon() as any}
              size={20}
              color={getHotspotColor()}
            />
          </Animated.View>
        </TouchableOpacity>
      </MotiView>
    );
  });
  HotspotOverlay.displayName = "HotspotOverlay";


  // Enhanced tour controls component
  const VirtualTourControls = React.memo<VirtualTourControlsProps>(({
    currentPoint,
    tour,
    onNavigate,
    onToggleFullscreen,
    onToggleAR,
    onShare,
    onClose,
    isFullscreen,
    arEnabled,
  }) => (
    <AnimatePresence>
      {showControls && (
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          transition={{ type: 'timing', duration: 300 }}
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 50 : 30,
            left: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <BlurView intensity={95} tint={theme.isDark ? 'dark' : 'light'} style={{ borderRadius: 25, overflow: 'hidden' }}>
            <LinearGradient
              colors={[theme.surface + 'E6', theme.surface + 'CC']}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
            >
              {/* Navigation Points */}
              <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                {tour.points.slice(0, 4).map((point, index) => (
                  <TouchableOpacity
                    key={point.id}
                    onPress={() => onNavigate(point.id)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: point.id === currentPoint.id ? theme.primary : theme.surface + '40',
                      borderWidth: 1,
                      borderColor: point.id === currentPoint.id ? theme.primary : theme.outline + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: point.id === currentPoint.id ? theme.surface : theme.onSurface,
                      }}
                    >
                      {index + 1}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Controls */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={onToggleAR}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: arEnabled ? theme.primary : theme.surface + '40',
                    borderWidth: 1,
                    borderColor: arEnabled ? theme.primary : theme.outline + '30',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name="augmented-reality"
                    size={20}
                    color={arEnabled ? theme.surface : theme.onSurface}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onToggleFullscreen}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isFullscreen ? theme.primary : theme.surface + '40',
                    borderWidth: 1,
                    borderColor: isFullscreen ? theme.primary : theme.outline + '30',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                    size={20}
                    color={isFullscreen ? theme.surface : theme.onSurface}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onShare}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.surface + '40',
                    borderWidth: 1,
                    borderColor: theme.outline + '30',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="share-outline" size={20} color={theme.onSurface} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.error + '20',
                    borderWidth: 1,
                    borderColor: theme.error + '30',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color={theme.error} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </MotiView>
      )}
    </AnimatePresence>
  ));
VirtualTourControls.displayName = "VirtualTourControls";

  if (!visible || !currentPoint) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden={isFullscreen} />

      <ThemedView style={{ flex: 1, backgroundColor: '#000000' }}>
        {/* Main Panorama View */}
        <View style={{ flex: 1, position: 'relative' }} {...panResponder.panHandlers}>
          <Animated.View
            style={{
              flex: 1,
              transform: [
                { rotateY: panX.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) },
                { rotateX: panY.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] }) },
                { scale },
              ],
            }}
          >
            <Image
              source={{ uri: currentPoint.panoramaUrl }}
              style={{
                width: screenWidth,
                height: screenHeight,
                resizeMode: 'cover',
              }}
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />
          </Animated.View>

          {/* AR Overlay */}
          {arEnabled && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 100, 255, 0.1)',
                zIndex: 10,
              }}
            >
              <ThemedView style={{
                position: 'absolute',
                top: 100,
                left: 20,
                backgroundColor: theme.primary + 'E6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}>
                <ThemedText style={{ color: theme.surface, fontWeight: '700' }}>
                  Mode AR Activé
                </ThemedText>
              </ThemedView>
            </MotiView>
          )}

          {/* Hotspots */}
          <AnimatePresence>
            {currentPoint.hotspots.map((hotspot) => (
              <HotspotOverlay
                key={hotspot.id}
                hotspot={hotspot}
                onPress={handleHotspotPress}
                scale={hotspotScale}
              />
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <BlurView intensity={80} style={{ borderRadius: 20, padding: 20 }}>
                <ThemedText style={{ color: theme.surface, fontSize: 16, fontWeight: '600' }}>
                  Chargement...
                </ThemedText>
              </BlurView>
            </MotiView>
          )}

          {/* Top Info Bar */}
          <Animated.View
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 60 : 40,
              left: 20,
              right: 20,
              opacity: controlsOpacity,
              zIndex: 100,
            }}
          >
            <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={{ borderRadius: 20, overflow: 'hidden' }}>
              <LinearGradient
                colors={[theme.surface + 'E6', theme.surface + 'CC']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', color: theme.onSurface }}>
                    {currentPoint.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80', marginTop: 2 }}>
                    {currentPoint.description}
                  </ThemedText>
                </View>

                <View style={{
                  backgroundColor: theme.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                }}>
                  <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
                    {currentPoint.roomType.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Controls */}
          <VirtualTourControls
            currentPoint={currentPoint}
            tour={tour}
            onNavigate={navigateToPoint}
            onToggleFullscreen={toggleFullscreen}
            onToggleAR={toggleARMode}
            onShare={handleShare}
            onClose={onClose}
            isFullscreen={isFullscreen}
            arEnabled={arEnabled}
          />
        </View>

        {/* Hotspot Details Modal */}
        {selectedHotspot && (
          <Modal
            visible={!!selectedHotspot}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedHotspot(null)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              <BlurView intensity={95} style={{ borderRadius: 25, overflow: 'hidden', maxWidth: 350 }}>
                <LinearGradient
                  colors={[theme.surface, theme.surface + 'F0']}
                  style={{ padding: 25 }}
                >
                  <ThemedText style={{ fontSize: 20, fontWeight: '700', marginBottom: 10 }}>
                    {selectedHotspot.content.title}
                  </ThemedText>

                  {selectedHotspot.content.description && (
                    <ThemedText style={{ fontSize: 14, lineHeight: 20, marginBottom: 15 }}>
                      {selectedHotspot.content.description}
                    </ThemedText>
                  )}

                  {selectedHotspot.content.measurementData && (
                    <View style={{ marginBottom: 15 }}>
                      <ThemedText style={{ fontWeight: '600', marginBottom: 5 }}>Dimensions:</ThemedText>
                      <ThemedText>{selectedHotspot.content.measurementData.dimensions}</ThemedText>
                      <ThemedText>Surface: {selectedHotspot.content.measurementData.surface}m²</ThemedText>
                    </View>
                  )}

                  {selectedHotspot.content.furnitureData && (
                    <View style={{ marginBottom: 15 }}>
                      <ThemedText style={{ fontWeight: '600', marginBottom: 5 }}>Mobilier:</ThemedText>
                      <ThemedText>{selectedHotspot.content.furnitureData.brand} - {selectedHotspot.content.furnitureData.model}</ThemedText>
                      {selectedHotspot.content.furnitureData.price && (
                        <ThemedText>Prix: €{selectedHotspot.content.furnitureData.price}</ThemedText>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => setSelectedHotspot(null)}
                    style={{
                      backgroundColor: theme.primary,
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 15,
                      alignItems: 'center',
                    }}
                  >
                    <ThemedText style={{ color: theme.surface, fontWeight: '700' }}>
                      Fermer
                    </ThemedText>
                  </TouchableOpacity>
                </LinearGradient>
              </BlurView>
            </View>
          </Modal>
        )}
      </ThemedView>
    </Modal>
  );
};

export default VirtualTourViewer;