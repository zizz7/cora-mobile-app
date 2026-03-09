import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

export default function AnimatedPressable({
    children,
    style,
    scaleTo = 0.95,
    onPressIn,
    onPressOut,
    ...props
}: AnimatedPressableProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
        scale.value = withSpring(scaleTo, {
            damping: 15,
            stiffness: 150,
        });
        if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
        if (onPressOut) onPressOut(e);
    };

    return (
        <AnimatedPressableComponent
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
            {...props as any}
        >
            {children}
        </AnimatedPressableComponent>
    );
}
