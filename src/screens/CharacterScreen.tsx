import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useCharacter } from '../context/CharacterContext';
import { colors } from '../theme/colors';
import { DEFAULT_AVATAR_URI } from '../utils/constants';
import { calculateLevel, xpCurrentToNext, xpIntoLevel } from '../utils/xp';

import type { StatKey } from '../types';

type Stat = {
  key: StatKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};



const STATS: Stat[] = [
  { key: 'strength', label: 'Сила', icon: 'fitness' },
  { key: 'intelligence', label: 'Интеллект', icon: 'bulb' },
  { key: 'speed', label: 'Скорость', icon: 'speedometer' },
];

export default function CharacterScreen() {
  const { character, spendStatPoint } = useCharacter();
  const [activeStat, setActiveStat] = useState<Stat | null>(null);

  const level = calculateLevel(character.xp);
  const xpIntoLevelValue = xpIntoLevel(character.xp);
  const xpToNext = xpCurrentToNext(character.xp);
  const xpPercent = Math.round((xpIntoLevelValue / xpToNext) * 100);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: character.avatar || DEFAULT_AVATAR_URI }}
            style={styles.characterAvatar}
            resizeMode="cover"
          />
        </View>
      </View>

      <Text style={styles.name}>{character.name}</Text>
      <Text style={styles.title}>
        {character.className} · Ур. {level}
      </Text>

      <View style={styles.xpBlock}>
        <Text style={styles.xpText}>
          Опыт: {xpIntoLevelValue.toLocaleString('ru-RU')} /{' '}
          {xpToNext.toLocaleString('ru-RU')} XP
        </Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      <View style={styles.pointsCard}>
        <Ionicons name="star" size={18} color={colors.accent} />
        <Text style={styles.pointsText}>
          Очки характеристик:{' '}
          <Text style={styles.pointsValue}>{character.statPoints}</Text>
        </Text>
      </View>

      {STATS.map((stat) => (
        <View key={stat.key} style={styles.statCard}>
          <View style={styles.statInfo}>
            <View style={styles.statIconWrap}>
              <Ionicons name={stat.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{character.stats[stat.key]}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.plusButton,
              character.statPoints <= 0 && styles.plusButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            disabled={character.statPoints <= 0}
            onPress={() => setActiveStat(stat)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      ))}

      <Modal
        visible={activeStat !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveStat(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {activeStat && (
              <>
                <View style={styles.modalIconWrap}>
                  <Ionicons
                    name={activeStat.icon}
                    size={26}
                    color={colors.accent}
                  />
                </View>
                <Text style={styles.modalTitle}>
                  Улучшить «{activeStat.label}»?
                </Text>
                <Text style={styles.modalSubtitle}>
                  Значение: {character.stats[activeStat.key]} →{' '}
                  {character.stats[activeStat.key] + 1}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.confirmButton,
                    character.statPoints <= 0 && styles.confirmButtonDisabled,
                    pressed &&
                      character.statPoints > 0 &&
                      styles.buttonPressed,
                  ]}
                  disabled={character.statPoints <= 0}
                  onPress={() => {
                    spendStatPoint(activeStat.key);
                    setActiveStat(null);
                  }}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color="#FFFFFF"
                    style={styles.confirmIcon}
                  />
                  <Text style={styles.confirmText}>
                    {character.statPoints > 0
                      ? `Потратить очко (осталось ${character.statPoints})`
                      : 'Нет свободных очков'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setActiveStat(null)}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarWrap: {
    marginTop: 8,
  },
  avatarBorder: {
    padding: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.borderGlow,
    backgroundColor: colors.card,
  },
  characterAvatar: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  name: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  title: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textSecondary,
  },
  xpBlock: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  xpText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  xpTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.xpTrack,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  pointsCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pointsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pointsValue: {
    fontWeight: '800',
    color: colors.accent,
  },
  statCard: {
    width: '100%',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  statMeta: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  statValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonDisabled: {
    backgroundColor: colors.cardBorder,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  confirmButton: {
    marginTop: 18,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.cardBorder,
  },
  confirmIcon: {
    marginRight: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
