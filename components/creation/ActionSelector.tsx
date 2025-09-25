import React from 'react';
import { View, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';

const { width, height } = Dimensions.get('window');

interface ActionSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectProperty: () => void;
  onSelectService: () => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({
  isVisible,
  onClose,
  onSelectProperty,
  onSelectService
}) => {
  const { theme } = useTheme();

  const actionOptions = [
    {
      id: 'property',
      title: 'Créer une Propriété',
      subtitle: 'Mettre en location ou vendre un bien immobilier',
      icon: 'home',
      iconType: 'MaterialIcons' as const,
      gradient: [theme.primary, theme.primary + '80'],
      onPress: onSelectProperty,
      features: [
        'Photos et descriptions détaillées',
        'Fixation du prix et des conditions',
        'Gestion des visites et candidatures',
        'Contrats et documents légaux'
      ]
    },
    {
      id: 'service',
      title: 'Créer un Service',
      subtitle: 'Proposer des services pour propriétaires et locataires',
      icon: 'tools',
      iconType: 'MaterialCommunityIcons' as const,
      gradient: [theme.success, theme.success + '80'],
      onPress: onSelectService,
      features: [
        'Maintenance et réparations',
        'Nettoyage et entretien',
        'Sécurité et surveillance',
        'Services de conciergerie'
      ]
    }
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView
        intensity={50}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, translateY: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            width: width * 0.9,
            maxHeight: height * 0.8,
            backgroundColor: theme.surface,
            borderRadius: 24,
            padding: 24,
            shadowColor: theme.onSurface,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <ThemedView style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            backgroundColor: 'transparent'
          }}>
            <ThemedView style={{ backgroundColor: 'transparent' }}>
              <ThemedText style={{
                fontSize: 24,
                fontWeight: '800',
                color: theme.onSurface
              }}>
                Que souhaitez-vous créer ?
              </ThemedText>
              <ThemedText style={{
                fontSize: 16,
                color: theme.onSurface + '80',
                marginTop: 4
              }}>
                Choisissez le type de création qui vous intéresse
              </ThemedText>
            </ThemedView>

            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: theme.surfaceVariant,
                borderRadius: 20,
                padding: 8
              }}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.onSurface + '80'}
              />
            </TouchableOpacity>
          </ThemedView>

          {/* Action Options */}
          <View style={{ gap: 16 }}>
            {actionOptions.map((option, index) => (
              <MotiView
                key={option.id}
                from={{ opacity: 0, translateX: -50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  delay: index * 200,
                  type: 'spring',
                  damping: 12
                }}
              >
                <TouchableOpacity
                  onPress={option.onPress}
                  activeOpacity={0.8}
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: theme.outline + '20'
                  }}
                >
                  <LinearGradient
                    colors={option.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 20,
                      minHeight: 120
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}>
                      <View style={{ flex: 1 }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8
                        }}>
                          <View style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 12,
                            padding: 8,
                            marginRight: 12
                          }}>
                            {option.iconType === 'MaterialIcons' ? (
                              <MaterialIcons
                                name={option.icon as any}
                                size={24}
                                color="white"
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name={option.icon as any}
                                size={24}
                                color="white"
                              />
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <ThemedText style={{
                              color: 'white',
                              fontSize: 18,
                              fontWeight: '700',
                              marginBottom: 4
                            }}>
                              {option.title}
                            </ThemedText>
                            <ThemedText style={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: 14,
                              lineHeight: 20
                            }}>
                              {option.subtitle}
                            </ThemedText>
                          </View>
                        </View>

                        {/* Features Preview */}
                        <View style={{
                          marginTop: 12,
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 8
                        }}>
                          {option.features.slice(0, 2).map((feature, idx) => (
                            <View
                              key={idx}
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 4
                              }}
                            >
                              <ThemedText style={{
                                color: 'white',
                                fontSize: 11,
                                fontWeight: '500'
                              }}>
                                {feature}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>

                      <MaterialIcons
                        name="arrow-forward-ios"
                        size={18}
                        color="rgba(255,255,255,0.8)"
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>

          {/* Quick Stats */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600, type: 'spring' }}
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: theme.surfaceVariant + '40',
              borderRadius: 16,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons
                name="home"
                size={20}
                color={theme.primary}
              />
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.onSurface,
                marginTop: 4
              }}>
                1.2k+
              </ThemedText>
              <ThemedText style={{
                fontSize: 12,
                color: theme.onSurface + '60'
              }}>
                Propriétés
              </ThemedText>
            </View>

            <View style={{
              width: 1,
              backgroundColor: theme.outline + '20',
              marginHorizontal: 16
            }} />

            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="tools"
                size={20}
                color={theme.success}
              />
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.onSurface,
                marginTop: 4
              }}>
                850+
              </ThemedText>
              <ThemedText style={{
                fontSize: 12,
                color: theme.onSurface + '60'
              }}>
                Services
              </ThemedText>
            </View>

            <View style={{
              width: 1,
              backgroundColor: theme.outline + '20',
              marginHorizontal: 16
            }} />

            <View style={{ alignItems: 'center' }}>
              <MaterialIcons
                name="star"
                size={20}
                color={theme.warning}
              />
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.onSurface,
                marginTop: 4
              }}>
                4.8
              </ThemedText>
              <ThemedText style={{
                fontSize: 12,
                color: theme.onSurface + '60'
              }}>
                Note moyenne
              </ThemedText>
            </View>
          </MotiView>

          {/* Bottom Tip */}
          <ThemedView style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: theme.primary + '10',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <MaterialIcons
              name="lightbulb"
              size={16}
              color={theme.primary}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={{
              fontSize: 12,
              color: theme.primary,
              flex: 1
            }}>
              Astuce: Vous pourrez modifier ou supprimer votre création à tout moment
            </ThemedText>
          </ThemedView>
        </MotiView>
      </BlurView>
    </Modal>
  );
};

export default ActionSelector;