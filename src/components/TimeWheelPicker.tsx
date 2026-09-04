import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { WheelPicker } from './WheelPicker';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...,55

const pad = (n: number) => n.toString().padStart(2, '0');

type Props = {
  initialHour?: number;
  initialMinute?: number;
  onChange: (time: string) => void;
};

/** iOS-style time roller: two wheels (hours / minutes) -> "HH:MM". */
export function TimeWheelPicker({
  initialHour = 9,
  initialMinute = 0,
  onChange,
}: Props) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const initialHourIndex = useMemo(
    () => HOURS.indexOf(initialHour),
    [initialHour],
  );
  const initialMinuteIndex = useMemo(
    () => MINUTES.indexOf(initialMinute),
    [initialMinute],
  );

  const emit = (h: number, m: number) => onChange(`${pad(h)}:${pad(m)}`);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <WheelPicker
          data={HOURS}
          getLabel={pad}
          initialIndex={initialHourIndex >= 0 ? initialHourIndex : 0}
          width={84}
          onChange={(index) => {
            const h = HOURS[index];
            setHour(h);
            emit(h, minute);
          }}
        />
        <Text style={styles.separator}>:</Text>
        <WheelPicker
          data={MINUTES}
          getLabel={pad}
          initialIndex={initialMinuteIndex >= 0 ? initialMinuteIndex : 0}
          width={84}
          onChange={(index) => {
            const m = MINUTES[index];
            setMinute(m);
            emit(hour, m);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  separator: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 4,
  },
});
