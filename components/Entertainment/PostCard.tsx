import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { theme } from '../../src/theme/theme';
import { ReactionButton } from './ReactionAnimations';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type PostCardProps = {
    post: any;
    onReact: (postId: number, reactionType: string) => void;
    onComment: (postId: number) => void;
    onReport: (postId: number) => void;
    currentUserId?: number; // to show active state
};

export const PostCard: React.FC<PostCardProps> = ({
    post,
    onReact,
    onComment,
    onReport,
    currentUserId,
}) => {
    const isVideo = post.media_type === 'video';
    const hasMedia = !!post.media_url;
    const [showReactions, setShowReactions] = useState(false);

    const handleReact = (type: string) => {
        onReact(post.id, type);
        setShowReactions(false);
    };

    return (
        <Pressable
            style={styles.card}
            onLongPress={() => setShowReactions(true)}
            onPress={() => setShowReactions(false)}
        >
            {/* Reaction Popover */}
            {showReactions && (
                <Animated.View
                    style={styles.reactionPickerOverlay}
                    entering={ZoomIn.duration(200).springify().damping(15)}
                    exiting={ZoomOut.duration(200)}
                >
                    <ReactionButton
                        icon={<Text style={{ fontSize: 28 }}>❤️</Text>}
                        count={0}
                        active={post.user_reaction_type === 'heart'}
                        onPress={() => handleReact('heart')}
                        hideCount
                    />
                    <ReactionButton
                        icon={<Text style={{ fontSize: 28 }}>😂</Text>}
                        count={0}
                        active={post.user_reaction_type === 'laugh'}
                        onPress={() => handleReact('laugh')}
                        hideCount
                    />
                    <ReactionButton
                        icon={<Text style={{ fontSize: 28 }}>😢</Text>}
                        count={0}
                        active={post.user_reaction_type === 'sad'}
                        onPress={() => handleReact('sad')}
                        hideCount
                    />
                </Animated.View>
            )}

            <View style={styles.header}>
                {post.user?.avatar_url ? (
                    <Image source={{ uri: post.user.avatar_url }} style={styles.authorBadge} />
                ) : (
                    <View style={styles.authorBadge}>
                        <Text style={styles.authorBadgeText}>
                            {post.user?.name ? post.user.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.user?.name || 'Unknown'}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            {post.content ? <Text style={styles.content}>{post.content}</Text> : null}

            {hasMedia && (
                <View style={styles.mediaContainer}>
                    {isVideo ? (
                        <VideoPlayer
                            uri={post.media_url}
                            style={styles.media}
                            loop
                            nativeControls
                            contentFit="cover"
                        />
                    ) : (
                        <Image
                            source={{ uri: post.media_url }}
                            style={styles.media}
                            contentFit="cover"
                        />
                    )}
                </View>
            )}

            <View style={styles.actionsContainer}>
                <View style={styles.reactionsGroup}>
                    {post.heart_count > 0 && (
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>❤️ {post.heart_count}</Text>
                        </View>
                    )}
                    {post.laugh_count > 0 && (
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>😂 {post.laugh_count}</Text>
                        </View>
                    )}
                    {post.sad_count > 0 && (
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>😢 {post.sad_count}</Text>
                        </View>
                    )}
                    {(post.heart_count === 0 && post.laugh_count === 0 && post.sad_count === 0) && (
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>React (Long Press)</Text>
                        </View>
                    )}
                </View>

                <View style={styles.rightActions}>
                    <TouchableOpacity style={styles.chip} onPress={() => onComment(post.id)}>
                        <Text style={styles.chipText}>💬 {post.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chip} onPress={() => onReport(post.id)}>
                        <Text style={styles.chipText}>🚩</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    authorBadgeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    content: {
        fontSize: 15,
        color: theme.colors.textPrimary,
        lineHeight: 22,
        marginBottom: 12,
    },
    mediaContainer: {
        width: '100%',
        height: (width - 64) * 0.75, // Aspect ratio
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        marginBottom: 16,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.borderLight,
        paddingTop: 12,
    },
    reactionsGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    reactionPickerOverlay: {
        position: 'absolute',
        top: -10,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 100,
    },
});
