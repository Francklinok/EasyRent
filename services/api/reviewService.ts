import { getGraphQLService } from './graphqlService';
import { API_CONFIG } from '../../constants/apiConfig';

export type ReviewTargetType = 'property' | 'owner' | 'tenant' | 'service';

export interface ReviewCriteria {
  label: string;
  score: number;
}

export interface ReviewReply {
  authorId: string;
  authorName: string;
  comment: string;
  createdAt: string;
}

export interface Review {
  id: string;
  _id?: string;
  targetId: string;
  targetType: ReviewTargetType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  criteria?: ReviewCriteria[];
  isVerified: boolean;
  reply?: ReviewReply;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: number[];
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const BASE = `${API_CONFIG.BASE_URL}/api/reviews`;

const REVIEWS_QUERY = `
  query GetReviews($targetId: ID!, $targetType: ReviewTargetType!, $page: Int, $limit: Int) {
    reviews(targetId: $targetId, targetType: $targetType, page: $page, limit: $limit) {
      reviews {
        id targetId targetType authorId authorName authorAvatar
        rating comment isVerified createdAt updatedAt
        criteria { label score }
        reply { authorId authorName comment createdAt }
      }
      pagination { page limit total pages }
    }
  }
`;

const REVIEW_STATS_QUERY = `
  query GetReviewStats($targetId: ID!, $targetType: ReviewTargetType) {
    reviewStats(targetId: $targetId, targetType: $targetType) {
      average total distribution
    }
  }
`;

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($targetId: ID!, $targetType: ReviewTargetType!, $rating: Int!, $comment: String!, $criteria: [ReviewCriteriaInput]) {
    createReview(targetId: $targetId, targetType: $targetType, rating: $rating, comment: $comment, criteria: $criteria) {
      id targetId targetType authorId authorName rating comment isVerified createdAt updatedAt
    }
  }
`;

const REPLY_TO_REVIEW_MUTATION = `
  mutation ReplyToReview($reviewId: ID!, $comment: String!) {
    replyToReview(reviewId: $reviewId, comment: $comment) {
      id reply { authorId authorName comment createdAt }
    }
  }
`;

const DELETE_REVIEW_MUTATION = `
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

const reviewService = {
  getReviews: async (
    targetId: string,
    targetType: ReviewTargetType,
    page = 1,
    limit = 20
  ): Promise<ReviewsResponse> => {
    try {
      const graphql = getGraphQLService();
      const data = await graphql.query<{ reviews: ReviewsResponse }>(
        REVIEWS_QUERY,
        { targetId, targetType, page, limit },
        'GetReviews'
      );
      return data.reviews;
    } catch (error) {
      console.warn('⚠️ [ReviewService] GraphQL failed, trying REST fallback...', error);
      const url = `${BASE}?targetId=${targetId}&targetType=${targetType}&page=${page}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur lors du chargement des avis');
      const json = await res.json();
      return { reviews: json.reviews, pagination: json.pagination };
    }
  },

  getStats: async (targetId: string, targetType?: ReviewTargetType): Promise<ReviewStats> => {
    try {
      const graphql = getGraphQLService();
      const data = await graphql.query<{ reviewStats: ReviewStats }>(
        REVIEW_STATS_QUERY,
        { targetId, targetType },
        'GetReviewStats'
      );
      return data.reviewStats;
    } catch (error) {
      console.warn('⚠️ [ReviewService] GraphQL stats failed, trying REST fallback...', error);
      const url = `${BASE}/stats/${targetId}${targetType ? `?targetType=${targetType}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur stats');
      const json = await res.json();
      return json.stats;
    }
  },

  createReview: async (
    _token: string,
    data: { targetId: string; targetType: ReviewTargetType; rating: number; comment: string; criteria?: ReviewCriteria[] }
  ): Promise<Review> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ createReview: Review }>(
        CREATE_REVIEW_MUTATION,
        data,
        'CreateReview'
      );
      return result.createReview;
    } catch (error) {
      console.warn('⚠️ [ReviewService] GraphQL createReview failed, trying REST fallback...', error);
      const token = _token;
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur création avis');
      return json.review;
    }
  },

  replyToReview: async (
    _token: string,
    reviewId: string,
    comment: string
  ): Promise<Review> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ replyToReview: Review }>(
        REPLY_TO_REVIEW_MUTATION,
        { reviewId, comment },
        'ReplyToReview'
      );
      return result.replyToReview;
    } catch (error) {
      console.warn('⚠️ [ReviewService] GraphQL replyToReview failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_token}` },
        body: JSON.stringify({ comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur réponse');
      return json.review;
    }
  },

  deleteReview: async (_token: string, reviewId: string): Promise<void> => {
    try {
      const graphql = getGraphQLService();
      await graphql.query<{ deleteReview: boolean }>(
        DELETE_REVIEW_MUTATION,
        { reviewId },
        'DeleteReview'
      );
    } catch (error) {
      console.warn('⚠️ [ReviewService] GraphQL deleteReview failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${_token}` },
      });
      if (!res.ok) throw new Error('Erreur suppression');
    }
  },
};

export default reviewService;
