import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { useNotes } from '../context/NotesContext';
import { useReminders } from '../context/RemindersContext';
import { colors } from '../theme/colors';
import { DEFAULT_AVATAR_URI } from '../utils/constants';
import { calculateLevel } from '../utils/xp';

import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets?.[0]?.base64) {
    return `data:image/png;base64,${result.assets[0].base64}`;
  }
  return null;
}

export default function SettingsScreen({ navigation }: Props) {
  const { character, updateCharacter, resetCharacter } = useCharacter();
  const { notes } = useNotes();
  const { reminders } = useReminders();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [nameDraft, setNameDraft] = useState(character.name);

  const handleReset = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите сбросить персонажа? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сбросить', style: 'destructive', onPress: resetCharacter },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            setNameDraft(character.name);
            setNameModalVisible(true);
          }}
          hitSlop={10}
        >
          <Ionicons name="pencil" size={24} color={colors.textSecondary} style={{ marginRight: 15 }} />
        </Pressable>
      ),
    });
  }, [navigation, character.name]);

  const level = calculateLevel(character.xp);
  const canSaveName = nameDraft.trim().length > 0;

  const saveName = () => {
    if (!canSaveName) return;
    updateCharacter({ name: nameDraft.trim() });
    setNameModalVisible(false);
  };

  const handlePickAvatar = async () => {
    setIsPickingAvatar(true);
    const uri = await pickImage();
    setIsPickingAvatar(false);
    if (uri) {
      updateCharacter({ avatar: uri });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Настройки</Text>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: character.avatar || DEFAULT_AVATAR_URI }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{character.name}</Text>
          <Text style={styles.profileMeta}>
            {character.className} · Ур. {level}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => {
            setNameDraft(character.name);
            setNameModalVisible(true);
          }}
        >
          <Ionicons
            name="happy-outline"
            size={20}
            color={colors.primaryLight}
          />
          <Text style={styles.rowLabel}>Имя персонажа</Text>
          <Text style={styles.rowValue}>{character.name}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={handlePickAvatar}
          disabled={isPickingAvatar}
        >
          <Ionicons name="person-circle-outline" size={20} color={colors.primaryLight} />
          <Text style={styles.rowLabel}>Аватарка</Text>
          <Text style={styles.rowValue}>
            {character.avatar ? 'Изменена' : 'Дефолтная'}
          </Text>
        </Pressable>

        <View style={styles.row}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={colors.primaryLight}
          />
          <Text style={styles.rowLabel}>Заметки</Text>
          <Text style={styles.rowValue}>{notes.length}</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Ionicons name="alarm-outline" size={20} color={colors.primaryLight} />
          <Text style={styles.rowLabel}>Задачи</Text>
          <Text style={styles.rowValue}>{reminders.length}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleReset}
      >
        <Ionicons name="refresh" size={18} color={colors.danger} />
        <Text style={styles.resetButtonText}>Сбросить прогресс</Text>
      </Pressable>

      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Сменить имя</Text>

            <TextInput
              style={styles.input}
              placeholder="Имя персонажа"
              placeholderTextColor={colors.textSecondary}
              value={nameDraft}
              onChangeText={setNameDraft}
              maxLength={20}
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !canSaveName && styles.saveButtonDisabled,
                pressed && canSaveName && styles.buttonPressed,
              ]}
              disabled={!canSaveName}
              onPress={saveName}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setNameModalVisible(false)}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </Pressable>
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
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 14.4,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  resetButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  avatarRowSelected: {
    borderColor: colors.accent,
  },
  avatarLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
});
