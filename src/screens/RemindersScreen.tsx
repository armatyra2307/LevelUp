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

import { useReminders } from '../context/RemindersContext';
import { colors } from '../theme/colors';
import { XP_PER_REMINDER } from '../utils/xp';

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, toggleReminder, addReminder, deleteReminder } =
    useReminders();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('');

  const canSave = label.trim().length > 0 && time.trim().length > 0;

  const saveReminder = () => {
    if (!canSave) return;
    addReminder(label.trim(), time.trim());
    setLabel('');
    setTime('');
    setModalVisible(false);
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
        onPress={() => setModalVisible(true)}
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
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Новая задача</Text>

            <TextInput
              style={styles.input}
              placeholder="Название"
              placeholderTextColor={colors.textSecondary}
              value={label}
              onChangeText={setLabel}
              maxLength={40}
            />

            <TextInput
              style={styles.input}
              placeholder="Время, например 09:00"
              placeholderTextColor={colors.textSecondary}
              value={time}
              onChangeText={setTime}
              maxLength={5}
            />

            <Text style={styles.hint}>
              За выполнение вы получите +{XP_PER_REMINDER} XP
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                pressed && canSave && styles.cardPressed,
              ]}
              disabled={!canSave}
              onPress={saveReminder}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                setLabel('');
                setTime('');
                setModalVisible(false);
              }}
            >
              <Text style={styles.cancelText}>Отмена</Text>
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.cardBorder,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
