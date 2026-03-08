import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Tabs, useFocusEffect } from 'expo-router';
import { preventScreenCaptureAsync, allowScreenCaptureAsync } from 'expo-screen-capture';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/utils/api';
import { PostCard } from '../../components/Entertainment/PostCard';
import { CreatePostModal } from '../../components/Entertainment/CreatePostModal';
import { CommentsSheet } from '../../components/Entertainment/CommentsSheet';
import { useAuth } from '../../src/context/AuthContext';
import Animated, { LinearTransition, FadeInDown, FadeOutDown } from 'react-native-reanimated';

export default function EntertainmentScreen() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modals state
    const [createPostVisible, setCreatePostVisible] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [activeComments, setActiveComments] = useState<any[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            // Prevent screenshots when screen is focused
            preventScreenCaptureAsync().catch(console.warn);

            return () => {
                // Allow screenshots when screen is unfocused
                allowScreenCaptureAsync().catch(console.warn);
            };
        }, [])
    );

    const fetchPosts = async () => {
        try {
            const data = (await api.get('/entertainment')) as any;
            setPosts(data.data);
        } catch (error) {
            console.error('Failed to fetch entertainment posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleReact = async (postId: number, reactionType: string) => {
        // Optimistic UI update
        setPosts(currentPosts => currentPosts.map(post => {
            if (post.id === postId) {
                let newPost = { ...post };

                // Remove old reaction count if exists
                if (newPost.user_reaction_type) {
                    newPost[`${newPost.user_reaction_type}_count`]--;
                }

                // Add new or toggle off
                if (newPost.user_reaction_type === reactionType) {
                    newPost.user_reaction_type = null;
                } else {
                    newPost.user_reaction_type = reactionType;
                    newPost[`${reactionType}_count`]++;
                }

                return newPost;
            }
            return post;
        }));

        try {
            await api.post(`/entertainment/${postId}/react`, { reaction_type: reactionType });
        } catch (error) {
            console.error('Failed to react:', error);
            fetchPosts(); // Revert on failure
        }
    };

    const handleComment = (postId: number) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            setActiveComments(post.comments || []);
            setActivePostId(postId);
            setCommentsVisible(true);
        }
    };

    const handleReport = (postId: number) => {
        Alert.prompt(
            'Report Post',
            'Why are you reporting this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: async (reason?: string) => {
                        if (!reason) return;
                        try {
                            await api.post(`/entertainment/${postId}/report`, { reason });
                            Alert.alert('Reported', 'The post has been reported.');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to report post.');
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    const onCommentAdded = (newComment: any) => {
        setActiveComments(prev => [...prev, newComment]);
        setPosts(currentPosts => currentPosts.map(post => {
            if (post.id === activePostId) {
                return {
                    ...post,
                    comments: [...(post.comments || []), newComment]
                };
            }
            return post;
        }));
    };

    const handleCommentReact = async (commentId: number, reactionType: string) => {
        // Optimistic UI update
        setActiveComments(currentComments => currentComments.map(comment => {
            if (comment.id === commentId) {
                let newComment = { ...comment };

                if (newComment.user_reaction_type) {
                    newComment[`${newComment.user_reaction_type}_count`]--;
                }

                if (newComment.user_reaction_type === reactionType) {
                    newComment.user_reaction_type = null;
                } else {
                    newComment.user_reaction_type = reactionType;
                    newComment[`${reactionType}_count`]++;
                }
                return newComment;
            }
            return comment;
        }));

        setPosts(currentPosts => currentPosts.map(post => {
            if (post.id === activePostId) {
                return {
                    ...post,
                    comments: post.comments?.map((c: any) => {
                        if (c.id === commentId) {
                            let newC = { ...c };
                            if (newC.user_reaction_type) newC[`${newC.user_reaction_type}_count`]--;
                            if (newC.user_reaction_type === reactionType) {
                                newC.user_reaction_type = null;
                            } else {
                                newC.user_reaction_type = reactionType;
                                newC[`${reactionType}_count`]++;
                            }
                            return newC;
                        }
                        return c;
                    })
                };
            }
            return post;
        }));

        try {
            await api.post(`/entertainment/comments/${commentId}/react`, { reaction_type: reactionType });
        } catch (error) {
            console.error('Failed to react to comment:', error);
            fetchPosts(); // Revert on failure
        }
    };

    return (
        <View style={styles.container}>
            <Tabs.Screen options={{
                headerTitle: 'Entertainment',
                headerRight: () => (
                    <TouchableOpacity style={{ marginRight: 15 }} onPress={() => setCreatePostVisible(true)}>
                        <Ionicons name="add-circle" size={28} color={theme.colors.teal} />
                    </TouchableOpacity>
                )
            }} />

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <Text>Loading fun...</Text>
                </View>
            ) : (
                <Animated.FlatList
                    data={posts}
                    keyExtractor={(item: any) => item.id.toString()}
                    itemLayoutAnimation={LinearTransition.springify().damping(20).stiffness(90)}
                    renderItem={({ item, index }: any) => (
                        <Animated.View
                            entering={FadeInDown.springify().damping(20).stiffness(90).delay(index * 100)}
                            exiting={FadeOutDown.springify().damping(20)}
                        >
                            <PostCard
                                post={item}
                                onReact={handleReact}
                                onComment={handleComment}
                                onReport={handleReport}
                                currentUserId={user?.id}
                            />
                        </Animated.View>
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text>No posts yet. Be the first to share something fun!</Text>
                        </View>
                    }
                    bounces={true}
                    overScrollMode="always"
                />
            )}

            <CreatePostModal
                visible={createPostVisible}
                onClose={() => setCreatePostVisible(false)}
                onPostCreated={onRefresh}
            />

            <CommentsSheet
                visible={commentsVisible}
                postId={activePostId}
                comments={activeComments}
                onClose={() => setCommentsVisible(false)}
                onCommentAdded={onCommentAdded}
                onCommentReact={handleCommentReact}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setCreatePostVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="create-outline" size={26} color={theme.colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 50,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    }
});
