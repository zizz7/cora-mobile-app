import React from 'react';
import { Pressable, PressableProps, Animated, ViewStyle, StyleProp } from 'react-native';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    duration?: number;
}

export default function AnimatedPressable({
    children,
    style,
    scaleTo = 0.95,
    duration = 150,
    onPressIn,
    onPressOut,
    ...props
}: AnimatedPressableProps) {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
        Animated.spring(scaleValue, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
        if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
        if (onPressOut) onPressOut(e);
    };

    return (
        <AnimatedPressableComponent
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, { transform: [{ scale: scaleValue }] }]}
            {...props as any}
        >
            {children}
        </AnimatedPressableComponent>
    );
}
