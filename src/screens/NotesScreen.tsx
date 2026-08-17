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

import { useNotes } from '../context/NotesContext';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/helpers';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList>;

export default function NotesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { notes, addNote, deleteNote } = useNotes();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const canSave = title.trim().length > 0;

  const saveNote = () => {
    if (!canSave) return;
    addNote(title.trim(), body.trim());
    setTitle('');
    setBody('');
    setModalVisible(false);
  };



  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={notes}
        keyExtractor={(note) => note.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Заметок пока нет. Добавьте первую!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardPressed]}
              onPress={() =>
                navigation.navigate('Details', {
                  noteId: item.id,
                  title: item.title,
                })
              }
            >
              <View style={styles.noteHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={colors.primaryLight}
                />
                <Text style={styles.noteTitle}>{item.title}</Text>
              </View>
              <Text style={styles.notePreview}>{item.body}</Text>
              <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.cardPressed,
              ]}
              onPress={() => deleteNote(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </Pressable>
          </View>
        )}
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
        <Text style={styles.addButtonText}>Новая заметка</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Новая заметка</Text>

            <TextInput
              style={styles.input}
              placeholder="Заголовок"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <TextInput
              style={[styles.input, styles.bodyInput]}
              placeholder="Текст заметки"
              placeholderTextColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                pressed && canSave && styles.cardPressed,
              ]}
              disabled={!canSave}
              onPress={saveNote}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                setTitle('');
                setBody('');
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
  noteCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.7,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  notePreview: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  noteDate: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    alignSelf: 'center',
    marginLeft: 8,
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
  bodyInput: {
    minHeight: 100,
    textAlignVertical: 'top',
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
