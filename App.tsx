import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated',
  'style.resizeMode is deprecated',
]);

import { CharacterProvider } from './src/context/CharacterContext';
import { NotesProvider } from './src/context/NotesContext';
import { RemindersProvider } from './src/context/RemindersContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <CharacterProvider>
        <NotesProvider>
          <RemindersProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </RemindersProvider>
        </NotesProvider>
      </CharacterProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
