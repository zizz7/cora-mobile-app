/**
 * PillHeader — Reusable floating white pill header component.
 * Sits at the top of the screen, overlaying the status bar area.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme/theme';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24);

interface PillHeaderProps {
    title: string;
    showBack?: boolean;
}

export default function PillHeader({ title, showBack = true }: PillHeaderProps) {
    const router = useRouter();

    return (
        <View style={styles.pillHeader}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            {showBack ? (
                <View style={styles.row}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{title}</Text>
                    </View>
                    <View style={{ width: 36 }} />
                </View>
            ) : (
                <View style={styles.pill}>
                    <Text style={styles.pillText}>{title}</Text>
                </View>
            )}
        </View>
    );
}

export { STATUSBAR_HEIGHT };

const styles = StyleSheet.create({
    pillHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: STATUSBAR_HEIGHT - 6,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.level1,
    },
    pill: {
        alignSelf: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        ...theme.shadows.level1,
    },
    pillText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
});
