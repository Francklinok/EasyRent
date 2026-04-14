import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import socialService, { SocialPost, FeedFilter, PostType } from '@/services/api/socialService';
import { getAuthToken } from '@/hooks/useAuthToken';

const POST_TYPE_COLORS: Record<PostType, string> = {
  property_listing: '#10B981',
  rst_update: '#8B5CF6',
  market_insight: '#F59E0B',
  tenant_review: '#6366F1',
  investment_tip: '#3B82F6',
  general: '#9CA3AF',
};

const POST_TYPE_LABELS: Record<PostType, string> = {
  property_listing: 'Bien',
  rst_update: 'RST',
  market_insight: 'Marché',
  tenant_review: 'Avis',
  investment_tip: 'Conseil',
  general: 'Post',
};

const FILTER_OPTIONS: { key: FeedFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'Tout', icon: 'grid-outline' },
  { key: 'properties', label: 'Biens', icon: 'home-outline' },
  { key: 'rst', label: 'RST', icon: 'trending-up-outline' },
  { key: 'market', label: 'Marché', icon: 'bar-chart-outline' },
  { key: 'tips', label: 'Conseils', icon: 'bulb-outline' },
];

export default function SocialFeedScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FeedFilter>('all');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [posting, setPosting] = useState(false);

  const userId = (user as any)?._id || (user as any)?.id;

  const loadFeed = useCallback(async (reset = false) => {
    try {
      const p = reset ? 1 : page;
      const res = await socialService.getFeed(filter, p);
      const newPosts = res.posts.map(post => ({
        ...post,
        liked: post.likes.includes(userId),
        saved: post.saves.includes(userId),
      }));
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(p < res.pagination.pages);
      if (!reset) setPage(p + 1);
    } catch {
      // Silent fail - show whatever we have
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, page, userId]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setPosts([]);
    loadFeed(true);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadFeed(true);
  };

  const handleToggleLike = async (postId: string) => {
    const token = await getAuthToken();
    if (!token) { Alert.alert('Connexion requise'); return; }
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const wasLiked = p.liked;
      return {
        ...p,
        liked: !wasLiked,
        likes: wasLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId],
      };
    }));
    try {
      await socialService.toggleLike(token, postId);
    } catch {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const wasLiked = p.liked;
        return {
          ...p,
          liked: !wasLiked,
          likes: wasLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId],
        };
      }));
    }
  };

  const handleToggleSave = async (postId: string) => {
    const token = await getAuthToken();
    if (!token) { Alert.alert('Connexion requise'); return; }
    setPosts(prev => prev.map(p =>
      p._id !== postId ? p : { ...p, saved: !p.saved }
    ));
    try {
      await socialService.toggleSave(token, postId);
    } catch {
      setPosts(prev => prev.map(p =>
        p._id !== postId ? p : { ...p, saved: !p.saved }
      ));
    }
  };

  const handleCreatePost = async () => {
    const token = await getAuthToken();
    if (!token) { Alert.alert('Connexion requise'); return; }
    if (!newPostText.trim()) return;
    setPosting(true);
    try {
      const res = await socialService.createPost(token, { content: newPostText.trim() });
      const newPost: SocialPost = { ...res.post, liked: false, saved: false };
      setPosts(prev => [newPost, ...prev]);
      setNewPostText('');
      setShowCompose(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de publier');
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `Il y a ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    return new Date(iso).toLocaleDateString('fr-FR');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900', flex: 1 }}>Fil EasyRent</ThemedText>
        <TouchableOpacity
          style={[s.composeBtn, { backgroundColor: theme.primary }]}
          onPress={() => setShowCompose(!showCompose)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText type="body" style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Publier</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Compose Box */}
      {showCompose && (
        <ThemedView style={[s.composeBox, { backgroundColor: theme.surface, borderBottomColor: theme.outline + '20' }]}>
          <ThemedView style={[s.row, { gap: 10, alignItems: 'flex-start' }]}>
            <ThemedView style={[s.avatarCircle, { backgroundColor: theme.primary + '20' }]}>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>
                {((user as any)?.firstName || 'U').charAt(0).toUpperCase()}
              </ThemedText>
            </ThemedView>
            <TextInput
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder="Quoi de neuf sur le marché immobilier ?"
              placeholderTextColor={theme.onSurface + '40'}
              style={[s.composeInput, { color: theme.text, borderColor: theme.outline + '30', backgroundColor: theme.surfaceVariant }]}
              multiline
              maxLength={3000}
              autoFocus
            />
          </ThemedView>
          <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
            <ThemedText type="body" style={{ color: theme.onSurface + '40', fontSize: 11 }}>
              {newPostText.length}/3000
            </ThemedText>
            <ThemedView style={[s.row, { gap: 8 }]}>
              <TouchableOpacity onPress={() => { setShowCompose(false); setNewPostText(''); }}>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>Annuler</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.postBtn, { backgroundColor: newPostText.trim() ? theme.primary : theme.outline + '30' }]}
                onPress={handleCreatePost}
                disabled={!newPostText.trim() || posting}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="body" style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Publier</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        style={{ backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.outline + '15' }}
      >
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterChip, { backgroundColor: filter === f.key ? theme.primary : theme.surfaceVariant, borderColor: filter === f.key ? theme.primary : theme.outline + '25' }]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons name={f.icon as any} size={13} color={filter === f.key ? '#fff' : theme.onSurface + '60'} />
            <ThemedText type="body" style={{ color: filter === f.key ? '#fff' : theme.text, fontSize: 12, fontWeight: filter === f.key ? '700' : '500' }}>
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {posts.length === 0 ? (
            <ThemedView style={[s.emptyState, { borderColor: theme.outline + '20' }]}>
              <Ionicons name="newspaper-outline" size={40} color={theme.onSurface + '30'} />
              <ThemedText type="body" style={{ color: theme.onSurface + '50', textAlign: 'center', marginTop: 8 }}>
                Aucun post pour l'instant. Soyez le premier à publier !
              </ThemedText>
            </ThemedView>
          ) : (
            posts.map(post => {
              const typeColor = POST_TYPE_COLORS[post.type] || '#9CA3AF';
              const typeLabel = POST_TYPE_LABELS[post.type] || 'Post';

              return (
                <ThemedView key={post._id} style={[s.postCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  {/* Author row */}
                  <ThemedView style={[s.row, { gap: 10 }]}>
                    <ThemedView style={[s.avatarCircle, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText type="body" style={{ color: typeColor, fontWeight: '700' }}>
                        {post.authorName.charAt(0).toUpperCase()}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedView style={[s.row, { gap: 6 }]}>
                        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>
                          {post.authorName}
                        </ThemedText>
                        {post.isVerified && (
                          <MaterialCommunityIcons name="check-decagram" size={14} color={theme.primary} />
                        )}
                        <ThemedView style={[{ backgroundColor: typeColor + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }]}>
                          <ThemedText type="body" style={{ color: typeColor, fontSize: 10, fontWeight: '700' }}>{typeLabel}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{formatTime(post.createdAt)}</ThemedText>
                    </ThemedView>
                  </ThemedView>

                  {/* Content */}
                  <ThemedText type="body" style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
                    {post.content}
                  </ThemedText>

                  {/* Property tag */}
                  {post.propertyTag && (
                    <ThemedView style={[s.row, { gap: 6, backgroundColor: '#10B98115', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }]}>
                      <Ionicons name="home" size={12} color="#10B981" />
                      <ThemedText type="body" style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{post.propertyTag.label}</ThemedText>
                    </ThemedView>
                  )}

                  {/* Actions */}
                  <ThemedView style={[s.row, { justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.outline + '15', paddingTop: 10 }]}>
                    <TouchableOpacity style={[s.row, { gap: 5 }]} onPress={() => handleToggleLike(post._id)}>
                      <Ionicons
                        name={post.liked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={post.liked ? '#EF4444' : theme.onSurface + '60'}
                      />
                      <ThemedText type="body" style={{ color: post.liked ? '#EF4444' : theme.onSurface + '60', fontSize: 13 }}>
                        {post.likes.length}
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[s.row, { gap: 5 }]}>
                      <Ionicons name="chatbubble-outline" size={17} color={theme.onSurface + '60'} />
                      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
                        {post.comments.length}
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[s.row, { gap: 5 }]}>
                      <Ionicons name="share-social-outline" size={18} color={theme.onSurface + '60'} />
                      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
                        {post.shares}
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleToggleSave(post._id)}>
                      <Ionicons
                        name={post.saved ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={post.saved ? theme.primary : theme.onSurface + '60'}
                      />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              );
            })
          )}

          {/* Load more */}
          {hasMore && posts.length > 0 && (
            <TouchableOpacity
              style={[s.loadMoreBtn, { borderColor: theme.outline + '30' }]}
              onPress={() => loadFeed(false)}
            >
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>Charger plus</ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  composeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  composeBox: { padding: 16, gap: 10, borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  composeInput: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  postCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 16, borderWidth: 1 },
  loadMoreBtn: { alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 14, borderWidth: 1 },
});
