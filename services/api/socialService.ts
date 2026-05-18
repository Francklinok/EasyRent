import { getGraphQLService } from './graphqlService';
import { API_CONFIG } from '../../constants/apiConfig';

export type PostType =
  | 'property_listing'
  | 'rst_update'
  | 'market_insight'
  | 'tenant_review'
  | 'investment_tip'
  | 'general';

export type FeedFilter = 'all' | 'properties' | 'rst' | 'market' | 'tips';

const TYPE_MAP: Record<FeedFilter, PostType | undefined> = {
  all: undefined,
  properties: 'property_listing',
  rst: 'rst_update',
  market: 'market_insight',
  tips: 'investment_tip',
};

export interface SocialComment {
  id: string;
  _id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  _id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isVerified: boolean;
  type: PostType;
  content: string;
  images: string[];
  propertyTag?: { propertyId: string; label: string };
  likesCount: number;
  commentsCount: number;
  comments: SocialComment[];
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  // legacy REST fields (for backwards compat)
  likes?: string[];
  saves?: string[];
  liked?: boolean;
  saved?: boolean;
}

export interface FeedResponse {
  posts: SocialPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const BASE = `${API_CONFIG.BASE_URL}/api/social`;

const SOCIAL_FEED_QUERY = `
  query SocialFeed($type: PostType, $page: Int, $limit: Int) {
    socialFeed(type: $type, page: $page, limit: $limit) {
      posts {
        id authorId authorName authorAvatar isVerified type content images
        likesCount commentsCount shares isLiked isSaved createdAt updatedAt
        propertyTag { propertyId label }
        comments { id authorId authorName authorAvatar text createdAt }
      }
      pagination { page limit total pages }
    }
  }
`;

const CREATE_POST_MUTATION = `
  mutation CreateSocialPost($content: String!, $type: PostType, $images: [String], $propertyTag: PropertyTagInput) {
    createSocialPost(content: $content, type: $type, images: $images, propertyTag: $propertyTag) {
      id authorId authorName type content images isVerified likesCount commentsCount isLiked isSaved createdAt updatedAt
    }
  }
`;

const TOGGLE_LIKE_MUTATION = `
  mutation ToggleLikePost($postId: ID!) {
    toggleLikePost(postId: $postId) {
      liked likesCount
    }
  }
`;

const ADD_COMMENT_MUTATION = `
  mutation AddComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      id commentsCount
      comments { id authorId authorName text createdAt }
    }
  }
`;

const TOGGLE_SAVE_MUTATION = `
  mutation ToggleSavePost($postId: ID!) {
    toggleSavePost(postId: $postId) {
      saved
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeleteSocialPost($postId: ID!) {
    deleteSocialPost(postId: $postId)
  }
`;

const socialService = {
  getFeed: async (filter: FeedFilter = 'all', page = 1, limit = 20): Promise<FeedResponse> => {
    const type = TYPE_MAP[filter];
    try {
      const graphql = getGraphQLService();
      const data = await graphql.query<{ socialFeed: FeedResponse }>(
        SOCIAL_FEED_QUERY,
        { type, page, limit },
        'SocialFeed'
      );
      return data.socialFeed;
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL failed, trying REST fallback...', error);
      const url = `${BASE}/feed?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur chargement du fil');
      const json = await res.json();
      // Map REST response to new format
      const posts: SocialPost[] = (json.posts || []).map((p: any) => ({
        ...p,
        id: p._id || p.id,
        likesCount: p.likes?.length || 0,
        commentsCount: p.comments?.length || 0,
        isLiked: false,
        isSaved: false,
        comments: (p.comments || []).map((c: any) => ({ ...c, id: c._id || c.id })),
      }));
      return { posts, pagination: json.pagination };
    }
  },

  createPost: async (
    _token: string,
    data: { content: string; type?: PostType; images?: string[]; propertyTag?: { propertyId: string; label: string } }
  ): Promise<SocialPost> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ createSocialPost: SocialPost }>(
        CREATE_POST_MUTATION,
        data,
        'CreateSocialPost'
      );
      return result.createSocialPost;
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL createPost failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur création post');
      return { ...json.post, id: json.post._id || json.post.id, likesCount: 0, commentsCount: 0, isLiked: false, isSaved: false };
    }
  },

  toggleLike: async (
    _token: string,
    postId: string
  ): Promise<{ liked: boolean; likesCount: number }> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ toggleLikePost: { liked: boolean; likesCount: number } }>(
        TOGGLE_LIKE_MUTATION,
        { postId },
        'ToggleLikePost'
      );
      return result.toggleLikePost;
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL toggleLike failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur like');
      return { liked: json.liked, likesCount: json.likesCount };
    }
  },

  addComment: async (
    _token: string,
    postId: string,
    text: string
  ): Promise<{ commentsCount: number }> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ addComment: SocialPost }>(
        ADD_COMMENT_MUTATION,
        { postId, text },
        'AddComment'
      );
      return { commentsCount: result.addComment.commentsCount };
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL addComment failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_token}` },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur commentaire');
      return { commentsCount: json.commentsCount };
    }
  },

  toggleSave: async (
    _token: string,
    postId: string
  ): Promise<{ saved: boolean }> => {
    try {
      const graphql = getGraphQLService();
      const result = await graphql.query<{ toggleSavePost: { saved: boolean } }>(
        TOGGLE_SAVE_MUTATION,
        { postId },
        'ToggleSavePost'
      );
      return result.toggleSavePost;
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL toggleSave failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/posts/${postId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur sauvegarde');
      return { saved: json.saved };
    }
  },

  deletePost: async (_token: string, postId: string): Promise<void> => {
    try {
      const graphql = getGraphQLService();
      await graphql.query<{ deleteSocialPost: boolean }>(
        DELETE_POST_MUTATION,
        { postId },
        'DeleteSocialPost'
      );
    } catch (error) {
      console.warn('⚠️ [SocialService] GraphQL deletePost failed, trying REST fallback...', error);
      const res = await fetch(`${BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${_token}` },
      });
      if (!res.ok) throw new Error('Erreur suppression post');
    }
  },
};

export default socialService;
