import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeWheelPicker } from '../components/TimeWheelPicker';
import { useReminders } from '../context/RemindersContext';
import { colors } from '../theme/colors';
import { modalStyles } from '../theme/modalStyles';
import { XP_PER_REMINDER } from '../utils/xp';

function getDefaultTime(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 5) * 5;
  const safeMinutes = minutes === 60 ? 0 : minutes;
  const safeHour = minutes === 60 ? (now.getHours() + 1) % 24 : now.getHours();
  return `${safeHour.toString().padStart(2, '0')}:${safeMinutes
    .toString()
    .padStart(2, '0')}`;
}

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, toggleReminder, addReminder, deleteReminder } =
    useReminders();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [time, setTime] = useState(() => getDefaultTime());
  const [pickerKey, setPickerKey] = useState(0);

  const canSave = label.trim().length > 0 && time.trim().length > 0;

  const openModal = () => {
    setLabel('');
    setTime(getDefaultTime());
    setPickerKey((key) => key + 1);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const saveReminder = () => {
    if (!canSave) return;
    addReminder(label.trim(), time.trim());
    setLabel('');
    setTime(getDefaultTime());
    closeModal();
  };

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={reminders}
        keyExtractor={(reminder) => reminder.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Задач нет. Добавьте первую!
          </Text>
        }
        renderItem={({ item }) => {
          const isDone = item.done;

          return (
            <View style={styles.reminderCard}>
              <Pressable
                style={({ pressed }) => [
                  styles.reminderMain,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => toggleReminder(item.id)}
              >
                <View
                  style={[
                    styles.checkCircle,
                    isDone && styles.checkCircleDone,
                  ]}
                >
                  {isDone && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={colors.success}
                    />
                  )}
                </View>
                <View style={styles.reminderInfo}>
                  <Text
                    style={[
                      styles.reminderLabel,
                      isDone && styles.reminderLabelDone,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.reminderTime}>{item.time}</Text>
                </View>
                {!isDone && (
                  <View style={styles.xpBadge}>
                    <Ionicons
                      name="star"
                      size={12}
                      color={colors.accent}
                    />
                    <Text style={styles.xpBadgeText}>+{XP_PER_REMINDER}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => deleteReminder(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
      />

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          { bottom: Math.max(24, insets.bottom + 12) },
          pressed && styles.cardPressed,
        ]}
        onPress={() => openModal()}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Новая задача</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>Новая задача</Text>

            <TextInput
              style={modalStyles.input}
              placeholder="Название"
              placeholderTextColor={colors.textSecondary}
              value={label}
              onChangeText={setLabel}
              maxLength={40}
            />

            <Text style={styles.inputLabel}>Время</Text>
            <View style={styles.timePickerRow}>
              <TimeWheelPicker
                key={pickerKey}
                initialHour={parseInt(time.split(':')[0] || '9', 10)}
                initialMinute={parseInt(time.split(':')[1] || '0', 10)}
                onChange={setTime}
              />
              <View style={styles.timeSummary}>
                <Text style={styles.timeSummaryText}>{time}</Text>
              </View>
            </View>

            <Text style={styles.hint}>
              За выполнение вы получите +{XP_PER_REMINDER} XP
            </Text>

            <Pressable
              style={({ pressed }) => [
                modalStyles.saveButton,
                !canSave && modalStyles.saveButtonDisabled,
                pressed && canSave && modalStyles.buttonPressed,
              ]}
              disabled={!canSave}
              onPress={saveReminder}
            >
              <Text style={modalStyles.saveButtonText}>Сохранить</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                modalStyles.cancelButton,
                pressed && modalStyles.buttonPressed,
              ]}
              onPress={() => {
                closeModal();
              }}
            >
              <Text style={modalStyles.cancelText}>Отмена</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: colors.textSecondary,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.7,
  },
  reminderMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkCircleDone: {
    borderColor: colors.success,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: 15,
    color: colors.text,
  },
  reminderLabelDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  reminderTime: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  timeSummary: {
  },
  timeSummaryText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
});
