import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type ReactionAnimationsProps = {
    icon: string | React.ReactNode;
    active: boolean;
    count: number;
    onPress: () => void;
    hideCount?: boolean;
};

export const ReactionButton: React.FC<ReactionAnimationsProps> = ({ icon, active, count, onPress, hideCount }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (active) {
            scale.value = withSequence(
                withTiming(1.2, { duration: 150 }),
                withSpring(1, { damping: 12, stiffness: 100 })
            );
        }
    }, [active]);

    const handlePress = () => {
        // trigger animation
        scale.value = withSequence(
            withTiming(0.9, { duration: 100 }),
            withSpring(1.1, { damping: 12, stiffness: 150 }),
            withSpring(1, { damping: 14, stiffness: 100 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                {typeof icon === 'string' ? <Animated.Text style={styles.emoji}>{icon}</Animated.Text> : icon}
            </Animated.View>
            {!hideCount && (
                <Animated.Text style={[styles.count, active && styles.activeCount]}>
                    {count}
                </Animated.Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    iconContainer: {
        marginRight: 6,
    },
    emoji: {
        fontSize: 20,
    },
    count: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    activeCount: {
        color: '#E91E63',
    },
});
