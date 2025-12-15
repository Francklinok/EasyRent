import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { useRouter } from 'expo-router';
import { ActivityProgress } from '@/services/activityProgressService';

interface ActivityHistoryCardProps {
    progress: ActivityProgress;
}

export const ActivityHistoryCard: React.FC<ActivityHistoryCardProps> = ({ progress }) => {
    const { theme } = useTheme();
    const router = useRouter();

    const openActivity = (activityType: 'visit' | 'reservation' | 'payment') => {
        const routes = {
            visit: '/booking/VisitScreen',
            reservation: '/booking/bookingscreen',
            payment: '/payement/PayementScreen'
        };

        router.push({
            pathname: routes[activityType],
            params: {
                propertyId: progress.propertyId,
                readOnly: 'true', // Mode lecture seule
                activityId: activityType === 'visit' ? progress.visitId :
                    activityType === 'reservation' ? progress.reservationId :
                        progress.paymentId
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return { name: 'check-circle', color: theme.success };
            case 'pending':
                return { name: 'clock-outline', color: theme.warning };
            case 'rejected':
                return { name: 'close-circle', color: theme.error };
            case 'completed':
                return { name: 'check-all', color: theme.success };
            default:
                return { name: 'help-circle', color: theme.onSurface + '50' };
        }
    };

    return (
        <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.outline + '20',
            shadowColor: theme.shadowColor || '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1
        }}>
            {/* Property Title */}
            <ThemedText style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.onSurface,
                marginBottom: 12
            }}>
                {progress.propertyTitle || 'Propriété'}
            </ThemedText>

            {/* Activities List */}
            <View style={{ gap: 8 }}>
                {/* Visit */}
                {progress.visitStatus !== 'none' && (
                    <TouchableOpacity
                        onPress={() => openActivity('visit')}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 10,
                            padding: 12
                        }}
                    >
                        <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: theme.primary + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12
                        }}>
                            <MaterialCommunityIcons name="calendar-check" size={18} color={theme.primary} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <ThemedText style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.onSurface
                            }}>
                                Visite
                            </ThemedText>
                            <ThemedText style={{
                                fontSize: 12,
                                color: theme.onSurface + '70'
                            }}>
                                {progress.visitStatus === 'accepted' ? 'Acceptée' :
                                    progress.visitStatus === 'pending' ? 'En attente' : 'Refusée'}
                            </ThemedText>
                        </View>

                        <MaterialCommunityIcons
                            name={getStatusIcon(progress.visitStatus).name as any}
                            size={20}
                            color={getStatusIcon(progress.visitStatus).color}
                        />
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={theme.onSurface + '50'}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                )}

                {/* Reservation */}
                {progress.reservationStatus !== 'none' && (
                    <TouchableOpacity
                        onPress={() => openActivity('reservation')}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 10,
                            padding: 12
                        }}
                    >
                        <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: theme.secondary + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12
                        }}>
                            <MaterialCommunityIcons name="file-document" size={18} color={theme.secondary} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <ThemedText style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.onSurface
                            }}>
                                Réservation
                            </ThemedText>
                            <ThemedText style={{
                                fontSize: 12,
                                color: theme.onSurface + '70'
                            }}>
                                {progress.reservationStatus === 'accepted' ? 'Acceptée' :
                                    progress.reservationStatus === 'pending' ? 'En attente' : 'Refusée'}
                            </ThemedText>
                        </View>

                        <MaterialCommunityIcons
                            name={getStatusIcon(progress.reservationStatus).name as any}
                            size={20}
                            color={getStatusIcon(progress.reservationStatus).color}
                        />
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={theme.onSurface + '50'}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                )}

                {/* Payment */}
                {progress.paymentStatus !== 'none' && (
                    <TouchableOpacity
                        onPress={() => openActivity('payment')}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 10,
                            padding: 12
                        }}
                    >
                        <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: theme.success + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12
                        }}>
                            <MaterialCommunityIcons name="credit-card-check" size={18} color={theme.success} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <ThemedText style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.onSurface
                            }}>
                                Paiement
                            </ThemedText>
                            <ThemedText style={{
                                fontSize: 12,
                                color: theme.onSurface + '70'
                            }}>
                                {progress.paymentStatus === 'completed' ? 'Effectué' : 'En attente'}
                            </ThemedText>
                        </View>

                        <MaterialCommunityIcons
                            name={getStatusIcon(progress.paymentStatus).name as any}
                            size={20}
                            color={getStatusIcon(progress.paymentStatus).color}
                        />
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={theme.onSurface + '50'}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Progress Indicator */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: theme.outline + '20'
            }}>
                <MaterialCommunityIcons
                    name="progress-check"
                    size={14}
                    color={theme.onSurface + '70'}
                />
                <ThemedText style={{
                    fontSize: 12,
                    color: theme.onSurface + '70',
                    marginLeft: 6
                }}>
                    Étape actuelle : {
                        progress.currentStep === 'visit' ? 'Visite' :
                            progress.currentStep === 'reservation' ? 'Réservation' :
                                progress.currentStep === 'payment' ? 'Paiement' :
                                    'Complété'
                    }
                </ThemedText>
            </View>
        </ThemedView>
    );
};
