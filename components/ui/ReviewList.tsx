import React, { useCallback, useState } from 'react';
import { FlatList, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';
import * as Haptics from 'expo-haptics';
import { generateStarArray } from '@/components/utils/ratingUtils';

export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  date: string;
  helpful?: number;
  verified?: boolean;
  images?: string[];
}

interface ReviewListProps {
  reviews: Review[];
  onHelpful?: (reviewId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  style?: ViewStyle;
}

/**
 * Composant ReviewList - Affiche la liste des avis/reviews
 * Similaire aux avis du Play Store
 */
export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onHelpful,
  onLoadMore,
  isLoading = false,
  hasMore = false,
  style,
}) => {
  const { theme } = useTheme();
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const handleHelpful = useCallback(
    (reviewId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (helpfulReviews.has(reviewId)) {
        setHelpfulReviews((prev) => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        setHelpfulReviews((prev) => new Set([...prev, reviewId]));
      }

      onHelpful?.(reviewId);
    },
    [helpfulReviews, onHelpful]
  );

  const renderReview = ({ item }: { item: Review }) => {
    const starsArray = generateStarArray(item.rating);
    const isHelpful = helpfulReviews.has(item.id);

    return (
      <ThemedView
        style={{
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20',
        }}
        backgroundColor="transparent"
      >
        {/* En-tête: Auteur et date */}
        <ThemedView
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
          backgroundColor="transparent"
        >
          <ThemedView backgroundColor="transparent">
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              backgroundColor="transparent"
            >
              {/* Avatar */}
              <ThemedView
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.primary + '30',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: theme.primary,
                  }}
                >
                  {item.author[0]?.toUpperCase()}
                </ThemedText>
              </ThemedView>

              {/* Nom et info */}
              <ThemedView backgroundColor="transparent">
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  backgroundColor="transparent"
                >
                  <ThemedText
                    style={{
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {item.author}
                  </ThemedText>
                  {item.verified && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={14}
                      color={theme.success || '#22c55e'}
                    />
                  )}
                </ThemedView>

                <ThemedText
                  style={{
                    fontSize: 12,
                    color: theme.outline,
                    marginTop: 2,
                  }}
                >
                  {item.date}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Étoiles */}
        <ThemedView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
          backgroundColor="transparent"
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
            backgroundColor="transparent"
          >
            {starsArray.map((star, index) => (
              <MaterialCommunityIcons
                key={`star-${index}`}
                name={
                  star === 'full'
                    ? 'star'
                    : star === 'half'
                    ? 'star-half-full'
                    : 'star-outline'
                }
                size={12}
                color={
                  star === 'empty'
                    ? theme.outline + '40'
                    : '#FCD34D'
                }
              />
            ))}
          </ThemedView>

          <ThemedText
            style={{
              fontSize: 12,
              color: theme.outline,
            }}
          >
            {item.rating}/5
          </ThemedText>
        </ThemedView>

        {/* Titre de l'avis */}
        {item.title && (
          <ThemedText
            style={{
              fontWeight: '600',
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            {item.title}
          </ThemedText>
        )}

        {/* Contenu de l'avis */}
        <ThemedText
          style={{
            fontSize: 12,
            lineHeight: 18,
            color: theme.text,
            marginBottom: 10,
          }}
        >
          {item.content}
        </ThemedText>

        {/* Images (si disponibles) */}
        {item.images && item.images.length > 0 && (
          <ThemedView
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 10,
            }}
            backgroundColor="transparent"
          >
            {item.images.map((image, index) => (
              <ThemedView
                key={`image-${index}`}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  backgroundColor: theme.outline + '20',
                }}
              />
            ))}
          </ThemedView>
        )}

        {/* Actions: Utile, Plus, ... */}
        <ThemedView
          style={{
            flexDirection: 'row',
            gap: 16,
          }}
          backgroundColor="transparent"
        >
          <TouchableOpacity
            onPress={() => handleHelpful(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 4,
              backgroundColor: isHelpful ? theme.primary + '20' : 'transparent',
            }}
          >
            <Ionicons
              name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
              size={14}
              color={isHelpful ? theme.primary : theme.outline}
            />
            <ThemedText
              style={{
                fontSize: 11,
                color: isHelpful ? theme.primary : theme.outline,
                fontWeight: isHelpful ? '600' : '500',
              }}
            >
              Utile
            </ThemedText>
            {item.helpful && item.helpful > 0 && (
              <ThemedText
                style={{
                  fontSize: 10,
                  color: isHelpful ? theme.primary : theme.outline,
                }}
              >
                ({item.helpful})
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={14}
              color={theme.outline}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      renderItem={renderReview}
      scrollEnabled={false}
      onEndReached={() => {
        if (hasMore && onLoadMore && !isLoading) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <ThemedView
          style={{
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          backgroundColor="transparent"
        >
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={theme.outline + '40'}
          />
          <ThemedText
            style={{
              marginTop: 12,
              color: theme.outline,
              textAlign: 'center',
            }}
          >
            Aucun avis pour le moment
          </ThemedText>
        </ThemedView>
      }
      ListFooterComponent={
        isLoading ? (
          <ThemedView style={{ padding: 16, alignItems: 'center' }} backgroundColor="transparent">
            {/* Loading indicator could go here */}
          </ThemedView>
        ) : null
      }
    />
  );
};

export default ReviewList;
