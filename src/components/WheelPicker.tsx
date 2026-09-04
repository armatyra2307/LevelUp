import { useEffect, useRef } from 'react';
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const PAD = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

type Props<T> = {
  data: readonly T[];
  getLabel: (item: T) => string;
  initialIndex?: number;
  onChange: (index: number) => void;
  width?: number;
  style?: ViewStyle;
};

/**
 * iOS-style wheel picker (roller).
 * Uses a ScrollView with native snap + a watchdog timer that forces the wheel
 * to the closest row whenever scrolling stops, so it never rests between rows.
 * Opacity/scale interpolation gives the "drum" effect; a centered selection
 * indicator mimics UIPickerView.
 */
export function WheelPicker<T>({
  data,
  getLabel,
  initialIndex = 0,
  onChange,
  width = 90,
  style,
}: Props<T>) {
  // Offset (in content coordinates) that centers item `index`.
  // The top padding (PAD) shifts item 0 into the selection bar at offset 0,
  // so the centering offset is just index * ITEM_HEIGHT.
  const centerOffset = (index: number) => index * ITEM_HEIGHT;

  const scrollY = useRef(new Animated.Value(centerOffset(initialIndex))).current;
  const scrollRef = useRef<ScrollView>(null);
  const lastIndex = useRef(initialIndex);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    if (clamped !== lastIndex.current) {
      lastIndex.current = clamped;
      onChange(clamped);
    }
  };

  const clearTimer = () => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  /**
   * Watchdog snap: whenever scrolling stops for a short moment, the wheel is
   * moved to the closest item so it never rests between rows. Works for slow
   * drags, momentum and platforms without reliable native snapping.
   */
  const scheduleSnap = (offset: number) => {
    clearTimer();
    settleTimer.current = setTimeout(() => {
      settleTimer.current = null;
      const clamped = Math.max(
        0,
        Math.min(Math.round(offset / ITEM_HEIGHT), data.length - 1),
      );
      const target = centerOffset(clamped);

      if (Math.abs(offset - target) > 1) {
        scrollRef.current?.scrollTo({ y: target, animated: true });
      }
      commitIndex(clamped);
    }, 120);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offset);
    scheduleSnap(offset);
  };

  // Make sure the wheel starts on the initial value, even if the platform
  // ignores the `contentOffset` prop on mount.
  useEffect(() => {
    const clamped = Math.max(0, Math.min(initialIndex, data.length - 1));
    scrollRef.current?.scrollTo({
      y: centerOffset(clamped),
      animated: false,
    });
  }, [data.length, initialIndex]);

  useEffect(() => () => clearTimer(), []);

  const renderItem = (item: T, index: number) => {
    const center = centerOffset(index);
    const inputRange = [
      center - 2 * ITEM_HEIGHT,
      center,
      center + 2 * ITEM_HEIGHT,
    ];
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.25, 1, 0.25],
      extrapolate: 'clamp',
    });
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.item,
          { height: ITEM_HEIGHT, opacity, transform: [{ scale }] },
        ]}
      >
        <Text style={styles.itemText}>{getLabel(item)}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { width, height: PICKER_HEIGHT }, style]}>
      <ScrollView
        ref={scrollRef}
        contentOffset={{ x: 0, y: centerOffset(initialIndex) }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        contentContainerStyle={{ paddingVertical: PAD }}
        onScrollBeginDrag={clearTimer}
        onScroll={handleScroll}
      >
        {data.map(renderItem)}
      </ScrollView>
      {/* Center selection indicator */}
      <View style={styles.selectionOverlay} pointerEvents="none">
        <View
          style={[
            styles.selectionBar,
            { top: PAD, height: ITEM_HEIGHT, width },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  selectionBar: {
    position: 'absolute',
    left: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'transparent',
  },
});
