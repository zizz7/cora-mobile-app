/**
 * Create Post Screen — Post to the feed with text, images, or YouTube links.
 */
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Image, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../src/theme/theme';
import { useCreatePost } from '../src/hooks/useCreatePost';
import PillHeader, { STATUSBAR_HEIGHT } from '../src/components/PillHeader';

export default function CreatePostScreen() {
    const router = useRouter();
    const createPost = useCreatePost();

    const [body, setBody] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [images, setImages] = useState<{ uri: string; name: string; type: string }[]>([]);
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.fileName || `photo_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            }));
            setImages(prev => [...prev, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!body.trim() && images.length === 0 && !youtubeUrl.trim()) {
            Alert.alert('Empty Post', 'Please add some text, an image, or a YouTube link.');
            return;
        }

        try {
            await createPost.mutateAsync({
                body: body.trim() || undefined,
                media: images.length > 0 ? images : undefined,
                youtube_url: youtubeUrl.trim() || undefined,
            });
            Alert.alert('Success', 'Your post has been published!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create post');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Create Post" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Post Body */}
                <TextInput
                    style={styles.bodyInput}
                    placeholder="What's on your mind?"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    value={body}
                    onChangeText={setBody}
                    textAlignVertical="top"
                />

                {/* Image Previews */}
                {images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => (
                            <View key={i} style={styles.imageThumb}>
                                <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                                    <Ionicons name="close-circle" size={22} color={theme.colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* YouTube URL Input */}
                {showYoutubeInput && (
                    <View style={styles.youtubeRow}>
                        <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" />
                        <TextInput
                            style={styles.youtubeInput}
                            placeholder="Paste YouTube URL..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={youtubeUrl}
                            onChangeText={setYoutubeUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                        <TouchableOpacity onPress={() => { setShowYoutubeInput(false); setYoutubeUrl(''); }}>
                            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Attachment Bar */}
                <View style={styles.attachBar}>
                    <TouchableOpacity style={styles.attachBtn} onPress={pickImages}>
                        <Ionicons name="image-outline" size={22} color={theme.colors.teal} />
                        <Text style={styles.attachText}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachBtn} onPress={() => setShowYoutubeInput(true)}>
                        <MaterialCommunityIcons name="youtube" size={22} color="#FF0000" />
                        <Text style={styles.attachText}>YouTube</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Post Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.postButton, (!body.trim() && images.length === 0 && !youtubeUrl.trim()) && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={createPost.isPending}
                    activeOpacity={0.8}
                >
                    {createPost.isPending ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <>
                            <Ionicons name="send" size={20} color={theme.colors.white} />
                            <Text style={styles.postButtonText}>Publish Post</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: STATUSBAR_HEIGHT + 50,
    },
    bodyInput: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 20,
        minHeight: 160,
        fontFamily: theme.fonts.bodyL,
        fontSize: 16,
        color: theme.colors.textPrimary,
        lineHeight: 24,
        ...theme.shadows.level1,
    },
    imageRow: {
        marginTop: 16,
    },
    imageThumb: {
        width: 100,
        height: 100,
        borderRadius: theme.radius.md,
        marginRight: 12,
        overflow: 'hidden',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    youtubeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.md,
        padding: 14,
        marginTop: 16,
        gap: 10,
        ...theme.shadows.level1,
    },
    youtubeInput: {
        flex: 1,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    attachBar: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    attachBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: theme.radius.pill,
        ...theme.shadows.level1,
    },
    attachText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 36,
        backgroundColor: theme.colors.bgPage,
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.teal,
        borderRadius: theme.radius.md,
        paddingVertical: 16,
        ...theme.shadows.level2,
    },
    postButtonDisabled: {
        opacity: 0.5,
    },
    postButtonText: {
        fontFamily: theme.fonts.button,
        fontSize: 16,
        color: theme.colors.white,
    },
});
