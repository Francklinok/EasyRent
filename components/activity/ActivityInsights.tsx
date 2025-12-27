import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useActivityStats } from '@/hooks/useActivity';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityInsightsProps {
  userId: string;
  timeRange?: 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'year') => void;
}

const { width } = Dimensions.get('window');

const ActivityInsights: React.FC<ActivityInsightsProps> = ({
  userId,
  timeRange = 'month',
  onTimeRangeChange
}) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);

  // Calculate date range based on selected period
  const getTimeRange = () => {
    const now = new Date();
    const from = new Date();

    switch (selectedPeriod) {
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      from: from.toISOString(),
      to: now.toISOString()
    };
  };

  const { stats, loading, error } = useActivityStats(userId, undefined, getTimeRange());

  const periods = [
    { key: 'week', label: '7 jours', icon: 'calendar-week' },
    { key: 'month', label: '30 jours', icon: 'calendar-month' },
    { key: 'year', label: '1 an', icon: 'calendar' }
  ];

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    onTimeRangeChange?.(period);
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 70) return theme.success;
    if (rate >= 40) return theme.warning;
    return theme.error;
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 2) return theme.success;
    if (time <= 6) return theme.warning;
    return theme.error;
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 1) return 'Moins d\'1h';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.round(hours / 24);
    return `${days}j`;
  };

  if (loading) {
    return (
      <ThemedView style={{
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200
      }}>
        <MaterialCommunityIcons
          name="chart-line"
          size={48}
          color={theme.primary}
          style={{ marginBottom: 16 }}
        />
        <ThemedText style={{
          fontSize: 16,
          color: theme.onSurface + '80'
        }}>
          Analyse des activités...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !stats) {
    return (
      <ThemedView style={{
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200
      }}>
        <MaterialIcons
          name="error-outline"
          size={48}
          color={theme.error}
          style={{ marginBottom: 16 }}
        />
        <ThemedText style={{
          fontSize: 16,
          color: theme.error,
          textAlign: 'center'
        }}>
          Impossible de charger les statistiques
        </ThemedText>
      </ThemedView>
    );
  }

  const renderPeriodSelector = () => (
    <ThemedView style={{
      flexDirection: 'row',
      backgroundColor: theme.surfaceVariant,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20
    }}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          onPress={() => handlePeriodChange(period.key as any)}
          style={{
            flex: 1,
            backgroundColor: selectedPeriod === period.key ? theme.primary : 'transparent',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center'
          }}
        >
          <MaterialCommunityIcons
            name={period.icon as any}
            size={16}
            color={selectedPeriod === period.key ? 'white' : theme.onSurface + '80'}
            style={{ marginBottom: 4 }}
          />
          <ThemedText style={{
            fontSize: 12,
            fontWeight: '600',
            color: selectedPeriod === period.key ? 'white' : theme.onSurface + '80'
          }}>
            {period.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  const renderOverviewCards = () => (
    <ThemedView style={{ marginBottom: 20 }}>
      <ThemedText style={{
        fontSize: 18,
        fontWeight: '700',
        color: theme.onSurface,
        marginBottom: 16
      }}>
        Vue d'ensemble
      </ThemedText>

      <ThemedView style={{
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16
      }}>
        {/* Total Activities */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.primary, theme.primary + '80']}
            style={{
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <MaterialCommunityIcons
              name="timeline"
              size={24}
              color="white"
              style={{ marginBottom: 8 }}
            />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              color: 'white',
              marginBottom: 4
            }}>
              {stats.totalActivities}
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center'
            }}>
              Total activités
            </ThemedText>
          </LinearGradient>
        </MotiView>

        {/* Pending Activities */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.warning, theme.warning + '80']}
            style={{
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <MaterialCommunityIcons
              name="clock-alert"
              size={24}
              color="white"
              style={{ marginBottom: 8 }}
            />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              color: 'white',
              marginBottom: 4
            }}>
              {stats.pendingActivities}
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center'
            }}>
              En attente
            </ThemedText>
          </LinearGradient>
        </MotiView>
      </ThemedView>

      <ThemedView style={{
        flexDirection: 'row',
        gap: 12
      }}>
        {/* Conversion Rate */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300 }}
          style={{ flex: 1 }}
        >
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}>
            <MaterialCommunityIcons
              name="trending-up"
              size={24}
              color={getConversionRateColor(stats.conversionRate)}
              style={{ marginBottom: 8 }}
            />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              color: getConversionRateColor(stats.conversionRate),
              marginBottom: 4
            }}>
              {stats.conversionRate.toFixed(1)}%
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              textAlign: 'center'
            }}>
              Taux conversion
            </ThemedText>
          </ThemedView>
        </MotiView>

        {/* Response Time */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 400 }}
          style={{ flex: 1 }}
        >
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}>
            <MaterialCommunityIcons
              name="timer"
              size={24}
              color={getResponseTimeColor(stats.averageResponseTime)}
              style={{ marginBottom: 8 }}
            />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              color: getResponseTimeColor(stats.averageResponseTime),
              marginBottom: 4
            }}>
              {formatResponseTime(stats.averageResponseTime)}
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              textAlign: 'center'
            }}>
              Temps réponse
            </ThemedText>
          </ThemedView>
        </MotiView>
      </ThemedView>
    </ThemedView>
  );

  const renderActivityBreakdown = () => (
    <ThemedView style={{ marginBottom: 20 }}>
      <ThemedText style={{
        fontSize: 18,
        fontWeight: '700',
        color: theme.onSurface,
        marginBottom: 16
      }}>
        Répartition par type
      </ThemedText>

      <ThemedView style={{ gap: 12 }}>
        {stats.byType.map((item, index) => {
          const percentage = stats.totalActivities > 0
            ? (item.count / stats.totalActivities) * 100
            : 0;

          const getTypeColor = (type: string) => {
            switch (type) {
              case 'visit': return theme.primary;
              case 'reservation': return theme.success;
              case 'inquiry': return theme.warning;
              default: return theme.onSurface + '60';
            }
          };

          const getTypeIcon = (type: string) => {
            switch (type) {
              case 'visit': return 'calendar-check';
              case 'reservation': return 'home-check';
              case 'inquiry': return 'help-circle';
              default: return 'circle';
            }
          };

          const getTypeLabel = (type: string) => {
            switch (type) {
              case 'visit': return 'Visites';
              case 'reservation': return 'Réservations';
              case 'inquiry': return 'Demandes info';
              default: return type;
            }
          };

          return (
            <MotiView
              key={item.type}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 }}
            >
              <ThemedView style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.outline + '20'
              }}>
                <ThemedView style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <ThemedView style={{
                    backgroundColor: getTypeColor(item.type) + '20',
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 12
                  }}>
                    <MaterialCommunityIcons
                      name={getTypeIcon(item.type) as any}
                      size={16}
                      color={getTypeColor(item.type)}
                    />
                  </ThemedView>

                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.onSurface
                    }}>
                      {getTypeLabel(item.type)}
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 12,
                      color: theme.onSurface + '80'
                    }}>
                      {item.count} activité{item.count > 1 ? 's' : ''}
                    </ThemedText>
                  </ThemedView>

                  <ThemedText style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: getTypeColor(item.type)
                  }}>
                    {percentage.toFixed(1)}%
                  </ThemedText>
                </ThemedView>

                {/* Progress Bar */}
                <ThemedView style={{
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 4,
                  height: 6
                }}>
                  <ThemedView style={{
                    backgroundColor: getTypeColor(item.type),
                    borderRadius: 4,
                    height: 6,
                    width: `${percentage}%`
                  }} />
                </ThemedView>
              </ThemedView>
            </MotiView>
          );
        })}
      </ThemedView>
    </ThemedView>
  );

  const renderTrendsChart = () => (
    <ThemedView>
      <ThemedText style={{
        fontSize: 18,
        fontWeight: '700',
        color: theme.onSurface,
        marginBottom: 16
      }}>
        Tendances récentes
      </ThemedText>

      <ThemedView style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.outline + '20'
      }}>
        <FlatList
          data={stats.recentTrends.slice(-7)} // Last 7 days
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.date}
          renderItem={({ item, index }) => {
            const maxValue = Math.max(
              ...stats.recentTrends.map(d => Math.max(d.visits, d.reservations, d.payments))
            );

            return (
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
                style={{
                  alignItems: 'center',
                  marginRight: 16,
                  minWidth: 60
                }}
              >
                <ThemedView style={{
                  height: 80,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  {/* Visits Bar */}
                  <ThemedView style={{
                    backgroundColor: theme.primary,
                    width: 8,
                    height: maxValue > 0 ? (item.visits / maxValue) * 60 : 2,
                    borderRadius: 4,
                    marginBottom: 2
                  }} />

                  {/* Reservations Bar */}
                  <ThemedView style={{
                    backgroundColor: theme.success,
                    width: 8,
                    height: maxValue > 0 ? (item.reservations / maxValue) * 60 : 2,
                    borderRadius: 4,
                    marginBottom: 2
                  }} />

                  {/* Payments Bar */}
                  <ThemedView style={{
                    backgroundColor: theme.warning,
                    width: 8,
                    height: maxValue > 0 ? (item.payments / maxValue) * 60 : 2,
                    borderRadius: 4
                  }} />
                </ThemedView>

                <ThemedText style={{
                  fontSize: 10,
                  color: theme.onSurface + '80',
                  textAlign: 'center'
                }}>
                  {new Date(item.date).getDate()}
                </ThemedText>
              </MotiView>
            );
          }}
        />

        {/* Legend */}
        <ThemedView style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 16,
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.outline + '20'
        }}>
          {[
            { color: theme.primary, label: 'Visites' },
            { color: theme.success, label: 'Réservations' },
            { color: theme.warning, label: 'Paiements' }
          ].map((item) => (
            <ThemedView
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <ThemedView style={{
                backgroundColor: item.color,
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 6
              }} />
              <ThemedText style={{
                fontSize: 10,
                color: theme.onSurface + '80'
              }}>
                {item.label}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={{
      flex: 1,
      backgroundColor: theme.background,
      padding: 20
    }}>
      <ThemedText style={{
        fontSize: 24,
        fontWeight: '700',
        color: theme.onSurface,
        marginBottom: 20
      }}>
        Analyses d'activité
      </ThemedText>

      {renderPeriodSelector()}
      {renderOverviewCards()}
      {renderActivityBreakdown()}
      {renderTrendsChart()}
    </ThemedView>
  );
};

export default ActivityInsights;