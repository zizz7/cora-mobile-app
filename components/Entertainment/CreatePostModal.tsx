import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { API_BASE_URL, getToken } from '../../src/utils/api';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';

type CreatePostModalProps = {
    visible: boolean;
    onClose: () => void;
    onPostCreated: () => void;
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false);

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

    const submitPost = async () => {
        if (!content.trim() && !media) return;

        setLoading(true);
        try {
            const formData = new FormData();
            if (content) {
                formData.append('content', content);
            }

            if (media) {
                // Need to extract filename and type
                const fileType = media.uri.split('.').pop();

                formData.append('media', {
                    uri: media.uri,
                    name: `upload.${fileType}`,
                    type: media.type === 'video' ? `video/${fileType}` : `image/${fileType}`,
                } as any);
            }

            const token = await getToken();
            await fetch(`${API_BASE_URL}/entertainment`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            setContent('');
            setMedia(null);
            onPostCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Error sharing your fun moment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="none" transparent>
            <Animated.View style={styles.overlay} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} disabled={loading} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Animated.View
                        style={styles.sheet}
                        entering={SlideInDown.springify().damping(15).stiffness(150)}
                        exiting={SlideOutDown.duration(200)}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} disabled={loading}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>New Post</Text>
                            <TouchableOpacity
                                style={[styles.postButton, (!content.trim() && !media) && styles.postButtonDisabled]}
                                onPress={submitPost}
                                disabled={(!content.trim() && !media) || loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Post</Text>}
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Share a meme, joke, or office moment... (No screenshots allowed!)"
                            multiline
                            autoFocus
                            value={content}
                            onChangeText={setContent}
                        />

                        {media && (
                            <View style={styles.mediaPreview}>
                                <Image source={{ uri: media.uri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                                    <Ionicons name="close-circle" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.bottomBar}>
                            <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                                <Ionicons name="image" size={24} color={theme.colors.teal} />
                                <Text style={styles.mediaButtonText}>Photo / Video / GIF</Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: theme.colors.bgPage,
        height: '92%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
        paddingTop: 50,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    cancelText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    postButton: {
        backgroundColor: theme.colors.teal,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 64,
        alignItems: 'center',
    },
    postButtonDisabled: {
        backgroundColor: theme.colors.borderLight,
    },
    postButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    input: {
        fontSize: 18,
        padding: 16,
        color: theme.colors.textPrimary,
        minHeight: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.borderLight,
        backgroundColor: '#FFF',
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaButtonText: {
        fontSize: 16,
        color: theme.colors.teal,
        marginLeft: 8,
        fontWeight: '500',
    },
    mediaPreview: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        height: 200,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeMedia: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
});
