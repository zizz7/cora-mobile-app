import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { useMentions, Mention, useTranslate } from '../../src/hooks/useMentions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';

export default function MentionsScreen() {
    const { data: mentions, isLoading, isError } = useMentions();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load TripAdvisor mentions.</Text>
            </View>
        );
    }

    const openReviewUrl = (url?: string) => {
        if (url) {
            Linking.openURL(url).catch(() => console.log('Cannot open URL'));
        }
    };

    const MentionCard = ({ item }: { item: Mention }) => {
        const [translatedText, setTranslatedText] = React.useState<string | null>(null);
        const { mutate: translateText, isPending: isTranslating } = useTranslate();

        const handleTranslate = () => {
            if (translatedText) {
                setTranslatedText(null); // Toggle back to original
                return;
            }
            translateText(item.review_text, {
                onSuccess: (data: any) => {
                    if (data?.translated_text) {
                        setTranslatedText(data.translated_text);
                    } else if (data?.error) {
                        alert(data.error);
                    }
                },
                onError: () => alert('Failed to translate review.')
            });
        };

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={styles.taLogoBg}>
                            <MaterialCommunityIcons name="owl" size={24} color="#34E0A1" />
                        </View>
                        <View>
                            <Text style={styles.reviewerName}>{item.source}</Text>
                            <Text style={styles.reviewDate}>{new Date(item.review_date).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <MaterialCommunityIcons name="star" size={14} color="#FFFFFF" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>

                {item.employee_name && (
                    <View style={styles.mentionBanner}>
                        <MaterialCommunityIcons name="account-star" size={16} color={theme.colors.teal} />
                        <Text style={styles.mentionText}>
                            Mentioned: <Text style={styles.mentionName}>{item.employee_name}</Text>
                        </Text>
                    </View>
                )}

                <Text style={styles.reviewContent} numberOfLines={translatedText ? undefined : 4}>
                    "{translatedText || item.review_text}"
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.translateBtn}
                        onPress={handleTranslate}
                        disabled={isTranslating}
                    >
                        {isTranslating ? (
                            <ActivityIndicator size="small" color={theme.colors.teal} />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="translate" size={16} color={theme.colors.teal} />
                                <Text style={styles.translateText}>
                                    {translatedText ? 'Show Original' : 'Translate to English'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.readMoreBtn}
                        onPress={() => console.log('No platform URL from API', item.source)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.readMoreText}>Read Full Review</Text>
                        <MaterialCommunityIcons name="open-in-new" size={16} color="#0A2540" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderMention = ({ item }: { item: Mention }) => <MentionCard item={item} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Mentions" />

            <View style={[styles.heroBanner, { marginTop: STATUSBAR_HEIGHT + 40 }]}>
                <MaterialCommunityIcons name="star-circle" size={48} color={theme.colors.teal} />
                <Text style={styles.heroTitle}>Outstanding Service</Text>
                <Text style={styles.heroSubtitle}>Recent mentions of our wonderful staff on TripAdvisor</Text>
            </View>

            <FlatList
                data={mentions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMention}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="message-star-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No mentions yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
    },
    heroBanner: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginTop: 12,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taLogoBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#000000', // TripAdvisor black
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    reviewDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34E0A1', // TripAdvisor green
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
        marginLeft: 4,
    },
    mentionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F7F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    mentionText: {
        fontSize: 13,
        color: '#0A2540',
        marginLeft: 8,
    },
    mentionName: {
        fontWeight: '700',
        color: theme.colors.teal,
    },
    reviewContent: {
        fontSize: 15,
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 16,
    },
    readMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A2540',
        marginRight: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    translateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.transparent.teal10,
        borderRadius: 8,
    },
    translateText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.teal,
        marginLeft: 6,
    }
});
