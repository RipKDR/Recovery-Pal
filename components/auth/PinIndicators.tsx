import React, { memo } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PinIndicatorsProps {
    length: number;
    filledCount: number;
    error?: boolean;
}

function PinIndicatorsComponent({ length = 4, filledCount, error }: PinIndicatorsProps) {
    return (
        <View className="flex-row gap-6 mb-10 justify-center">
            {Array.from({ length }).map((_, i) => (
                <View
                    key={i}
                    className={`w-4 h-4 rounded-full border border-white/20 ${i < filledCount
                            ? error
                                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                : 'bg-white shadow-lg shadow-primary-500/50'
                            : 'bg-transparent'
                        }`}
                />
            ))}
        </View>
    );
}

export const PinIndicators = memo(PinIndicatorsComponent);
