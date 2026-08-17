import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useNotes } from '../context/NotesContext';
import { colors } from '../theme/colors';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route, navigation }: Props) {
  const { noteId } = route.params;
  const { notes, updateNote, deleteNote } = useNotes();

  const note = notes.find((item) => item.id === noteId);

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Заметка не найдена</Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    updateNote(note.id, title.trim(), body.trim());
    navigation.goBack();
  };

  const remove = () => {
    deleteNote(note.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Заголовок"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        maxLength={60}
      />

      <TextInput
        style={styles.bodyInput}
        placeholder="Текст заметки"
        placeholderTextColor={colors.textSecondary}
        value={body}
        onChangeText={setBody}
        multiline
      />

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canSave && styles.buttonDisabled,
            pressed && canSave && styles.buttonPressed,
          ]}
          disabled={!canSave}
          onPress={save}
        >
          <Text style={styles.buttonText}>Сохранить</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={remove}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Удалить</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  titleInput: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bodyInput: {
    marginTop: 12,
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: colors.cardBorder,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
