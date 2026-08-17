import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { useNotes } from '../context/NotesContext';
import { useReminders } from '../context/RemindersContext';
import { colors } from '../theme/colors';
import { DEFAULT_AVATAR_URI } from '../utils/constants';
import { calculateLevel, xpCurrentToNext, xpIntoLevel } from '../utils/xp';

import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { StatKey } from '../types';



type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const STAT_LABELS: Record<StatKey, string> = {
  strength: 'Сила',
  intelligence: 'Интеллект',
  speed: 'Скорость',
};

const STAT_ICONS: Record<StatKey, keyof typeof Ionicons.glyphMap> = {
  strength: 'fitness',
  intelligence: 'bulb',
  speed: 'speedometer',
};

type StatItemProps = {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
};

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const { character } = useCharacter();
  const { notes } = useNotes();
  const { reminders, toggleReminder } = useReminders();

  const level = calculateLevel(character.xp);
  const xpIntoLevelValue = xpIntoLevel(character.xp);
  const xpToNext = xpCurrentToNext(character.xp);
  const xpPercent = Math.round((xpIntoLevelValue / xpToNext) * 100);

  const recentNotes = notes.slice(0, 2);
  const recentReminders = reminders.slice(0, 3);

  const statEntries = (Object.keys(character.stats) as StatKey[]).map((key) => ({
    key,
    label: STAT_LABELS[key],
    value: character.stats[key],
    icon: STAT_ICONS[key],
  }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Привет, {character.name}!</Text>
        <Text style={styles.brand}>LevelUp</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Pressable onPress={() => navigation.navigate('Settings')}>
            <Image
              source={{ uri: character.avatar || DEFAULT_AVATAR_URI }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </Pressable>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>{character.name}</Text>
            <Text style={styles.heroTitle} numberOfLines={1}>{character.className}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Ур. {level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.heroRight}>
          <View style={styles.statsColumn}>
            {statEntries.map((stat) => (
              <StatItem
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.xpBlock}>
        <Text style={styles.xpText}>
          Опыт: {xpIntoLevelValue.toLocaleString('ru-RU')} /{' '}
          {xpToNext.toLocaleString('ru-RU')} XP
        </Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      <View style={[styles.sectionsContainer, !isMobile && styles.twoColumns]}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Мои Заметки</Text>

          {recentNotes.length === 0 && (
            <Text style={styles.emptyText}>Заметок пока нет</Text>
          )}

          {recentNotes.map((note) => (
            <Pressable
              key={note.id}
              style={({ pressed }) => [
                styles.noteCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate('Details', {
                  noteId: note.id,
                  title: note.title,
                })
              }
            >
              <View style={styles.noteHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={colors.primaryLight}
                />
                <Text style={styles.noteTitle}>{note.title}</Text>
              </View>
              <Text style={styles.notePreview}>{note.body}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Задачи</Text>

          {recentReminders.length === 0 && (
            <Text style={styles.emptyText}>Задач пока нет</Text>
          )}

          {recentReminders.map((reminder) => (
            <Pressable
              key={reminder.id}
              style={({ pressed }) => [
                styles.reminderCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => toggleReminder(reminder.id)}
            >
              <View
                style={[
                  styles.checkCircle,
                  reminder.done && styles.checkCircleDone,
                ]}
              >
                {reminder.done && (
                  <Ionicons name="checkmark" size={12} color={colors.success} />
                )}
              </View>
              <Text
                style={[
                  styles.reminderLabel,
                  reminder.done && styles.reminderLabelDone,
                ]}
              >
                {reminder.label}
              </Text>
              <Text style={styles.reminderTime}>{reminder.time}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  heroInfo: {
    marginLeft: 10,
    flex: 1,
  },
  heroName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  heroTitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 68,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 12,
  },
  heroRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  statsColumn: {
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    minWidth: 20,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  xpBlock: {
    marginTop: 16,
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
  sectionsContainer: {
    marginTop: 20,
    gap: 16,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.7,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  notePreview: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkCircleDone: {
    borderColor: colors.success,
  },
  reminderLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  reminderLabelDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  reminderTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
});
