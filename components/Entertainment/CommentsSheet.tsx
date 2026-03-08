import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { theme } from '../../src/theme/theme';
import { API_BASE_URL, getToken } from '../../src/utils/api';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { ReactionButton } from './ReactionAnimations';

type CommentsSheetProps = {
    visible: boolean;
    postId: number | null;
    comments: any[];
    onClose: () => void;
    onCommentAdded: (newComment: any) => void;
    onCommentReact: (commentId: number, reactionType: string) => void | Promise<void>;
};

export const CommentsSheet: React.FC<CommentsSheetProps> = ({ visible, postId, comments, onClose, onCommentAdded, onCommentReact }) => {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeReactionCommentId, setActiveReactionCommentId] = useState<number | null>(null);
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setMedia(result.assets[0]);
        }
    };

    const submitComment = async () => {
        if ((!content.trim() && !media) || !postId) return;

        setLoading(true);
        try {
            const formData = new FormData();
            if (content) formData.append('content', content.trim());

            if (media) {
                const fileType = media.uri.split('.').pop();
                formData.append('media', {
                    uri: media.uri,
                    name: `upload.${fileType}`,
                    type: media.type === 'video' ? `video/${fileType}` : `image/${fileType}`,
                } as any);
            }

            if (replyToCommentId) {
                formData.append('parent_id', replyToCommentId.toString());
            }

            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/entertainment/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            setContent('');
            setMedia(null);
            setReplyToCommentId(null);
            onCommentAdded(data);
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactionSelect = (commentId: number, reaction: string) => {
        onCommentReact(commentId, reaction);
        setActiveReactionCommentId(null);
    };

    const handleReply = (commentId: number, userName: string) => {
        setReplyToCommentId(commentId);
        setContent((prev) => prev ? `${prev} @${userName} ` : `@${userName} `);
    };

    const renderTextWithMentions = (text: string) => {
        if (!text) return null;
        const words = text.split(/(\s+)/);
        return (
            <Text style={styles.commentText}>
                {words.map((word, i) => {
                    if (word.startsWith('@') && word.length > 1) {
                        return (
                            <Text key={i} style={styles.mentionText}>
                                {word}
                            </Text>
                        );
                    }
                    return <Text key={i}>{word}</Text>;
                })}
            </Text>
        );
    };

    const renderCommentNode = (item: any, isReply: boolean = false, parentIdForReply: number) => {
        const showReactions = activeReactionCommentId === item.id;
        const isVideo = item.media_type === 'video';
        const hasReactions = item.heart_count > 0 || item.laugh_count > 0 || item.sad_count > 0;

        return (
            <Pressable
                key={item.id}
                style={[styles.commentContainer, isReply && styles.replyContainer]}
                onLongPress={() => setActiveReactionCommentId(showReactions ? null : item.id)}
            >
                {item.user?.avatar_url ? (
                    <Image source={{ uri: item.user.avatar_url }} style={styles.authorBadge} />
                ) : (
                    <View style={styles.authorBadge}>
                        <Text style={styles.authorBadgeText}>
                            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.commentContentWrapper}>
                    <View style={styles.commentBody}>
                        <Text style={styles.authorName}>{item.user?.name || 'Unknown'}</Text>
                        {item.content ? renderTextWithMentions(item.content) : null}

                        {item.media_url && (
                            <View style={styles.mediaContainer}>
                                {isVideo ? (
                                    <Video
                                        source={{ uri: item.media_url }}
                                        style={styles.media}
                                        useNativeControls
                                        resizeMode={ResizeMode.COVER}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: item.media_url }}
                                        style={styles.media}
                                        resizeMode="cover"
                                    />
                                )}
                            </View>
                        )}
                    </View>

                    {/* Show Reactions Context Menu on Long Press */}
                    {showReactions && (
                        <View style={styles.reactionPicker}>
                            <ReactionButton icon={<Text style={{ fontSize: 28 }}>❤️</Text>} count={0} active={false} hideCount onPress={() => handleReactionSelect(item.id, 'heart')} />
                            <ReactionButton icon={<Text style={{ fontSize: 28 }}>😂</Text>} count={0} active={false} hideCount onPress={() => handleReactionSelect(item.id, 'laugh')} />
                            <ReactionButton icon={<Text style={{ fontSize: 28 }}>😢</Text>} count={0} active={false} hideCount onPress={() => handleReactionSelect(item.id, 'sad')} />
                        </View>
                    )}

                    {/* Display existing reactions & Reply */}
                    <View style={styles.commentActionsRow}>
                        {hasReactions && (
                            <View style={styles.reactionsDisplayRow}>
                                {item.heart_count > 0 && <Text style={styles.reactionMiniCounter}>❤️ {item.heart_count}</Text>}
                                {item.laugh_count > 0 && <Text style={styles.reactionMiniCounter}>😂 {item.laugh_count}</Text>}
                                {item.sad_count > 0 && <Text style={styles.reactionMiniCounter}>😢 {item.sad_count}</Text>}
                            </View>
                        )}
                        <TouchableOpacity onPress={() => handleReply(parentIdForReply, item.user?.name || 'User')} style={styles.replyButton}>
                            <Text style={styles.replyText}>Reply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderComment = ({ item, index }: { item: any, index: number }) => {
        if (!item || !item.id) return null;

        return (
            <View>
                {renderCommentNode(item, false, item.id)}
                {item.replies && item.replies.length > 0 && (
                    <View style={styles.repliesWrapper}>
                        {item.replies.map((reply: any) => {
                            if (!reply || !reply.id) return null;
                            return renderCommentNode(reply, true, item.id);
                        })}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="none" transparent>
            <Animated.View style={styles.overlay} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => { setActiveReactionCommentId(null); onClose(); }} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end' }}
                >
                    <Animated.View
                        style={styles.sheet}
                        entering={SlideInDown.springify().damping(22).stiffness(90)}
                        exiting={SlideOutDown.duration(200)}
                    >
                        <Pressable style={{ flex: 1 }} onPress={() => setActiveReactionCommentId(null)}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Comments</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={comments || []}
                                keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
                                renderItem={renderComment}
                                contentContainerStyle={styles.list}
                                removeClippedSubviews={false} // Prevents clipping reaction popups on Android
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No comments yet. Start the conversation!</Text>
                                }
                            />

                            {media && (
                                <View style={styles.inputMediaPreviewContainer}>
                                    <Image source={{ uri: media.uri }} style={styles.inputMediaPreview} />
                                    <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                                        <Ionicons name="close-circle" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <TouchableOpacity style={styles.attachButton} onPress={pickMedia}>
                                    <Ionicons name="image" size={24} color={theme.colors.teal} />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.input}
                                    placeholder={replyToCommentId ? "Writing a reply..." : "Add a comment... (Long press to react!)"}
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                />
                                {replyToCommentId && (
                                    <TouchableOpacity style={styles.cancelReplyButton} onPress={() => { setReplyToCommentId(null); setContent(''); }}>
                                        <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.sendButton, (!content.trim() && !media) && styles.sendButtonDisabled]}
                                    onPress={submitComment}
                                    disabled={(!content.trim() && !media) || loading}
                                >
                                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
    },
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        overflow: 'visible', // Prevent clipping
    },
    repliesWrapper: {
        marginLeft: 24,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.borderLight,
        paddingLeft: 12,
        marginBottom: 16,
        marginTop: -8,
    },
    replyContainer: {
        marginBottom: 12,
    },
    authorBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    authorBadgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentContentWrapper: {
        flex: 1,
        position: 'relative',
        zIndex: 1, // needed for picker to overlay adjacent items
    },
    commentBody: {
        backgroundColor: theme.colors.bgPage,
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        zIndex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 15,
        color: theme.colors.textPrimary,
        marginBottom: 6,
    },
    mentionText: {
        color: theme.colors.teal,
        fontWeight: 'bold',
    },
    mediaContainer: {
        width: 200,
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 4,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    reactionPicker: {
        position: 'absolute',
        top: -40,
        left: 20,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 8,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 999, // very high elevation for android
        zIndex: 999, // very high zIndex for iOS
    },
    reactionsDisplayRow: {
        flexDirection: 'row',
        gap: 4,
    },
    reactionMiniCounter: {
        fontSize: 12,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    commentActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginLeft: 8,
        gap: 12,
    },
    replyButton: {
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    replyText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: 32,
    },
    inputMediaPreviewContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgPage,
    },
    inputMediaPreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    removeMedia: {
        position: 'absolute',
        top: 8,
        left: 60,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.borderLight,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    attachButton: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.borderLight,
    },
    cancelReplyButton: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
