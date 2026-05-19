import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme';

interface Props {
  isActive: boolean;
  barCount?: number;
  color?: string;
  height?: number;
}

export default function WaveformBar({ isActive, barCount = 20, color = Colors.primary, height = 40 }: Props) {
  const animations = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (isActive) {
      const anims = animations.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 60),
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.parallel(anims).start();
    } else {
      animations.forEach(anim => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={[styles.container, { height }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
