import React, { useCallback, useEffect, useState } from 'react';
import { NavContext, type Route } from './src/nav';
import { ActivityIndicator, BackHandler, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { loadState, useStore } from './src/store';
import { SpaceBackground, usePalette } from './src/components/ui';
import { stopSpeech } from './src/speech';
import { t } from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import WorldsScreen from './src/screens/WorldsScreen';
import WorldMenuScreen from './src/screens/WorldMenuScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import FindGameScreen from './src/screens/FindGameScreen';
import MatchGameScreen from './src/screens/MatchGameScreen';
import CalmScreen from './src/screens/CalmScreen';
import CaaBoard from './src/screens/CaaBoard';
import ParentScreen from './src/screens/ParentScreen';

export default function App() {
  const s = useStore();
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const [caaOpen, setCaaOpen] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const go = useCallback((r: Route) => setStack((st) => [...st, r]), []);
  const back = useCallback(() => {
    stopSpeech();
    setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
  }, []);
  const home = useCallback(() => {
    stopSpeech();
    setStack([{ name: 'home' }]);
  }, []);
  const openCaa = useCallback(() => setCaaOpen(true), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (caaOpen) {
        setCaaOpen(false);
        return true;
      }
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [caaOpen, stack.length]);

  if (!s.ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#060A22', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#5EE7FF" size="large" />
      </View>
    );
  }

  const route = stack[stack.length - 1];
  const childScreen = route.name !== 'parent';

  return (
    <SafeAreaProvider>
      <NavContext.Provider value={{ go, back, home, openCaa }}>
        <StatusBar style="light" />
        <SpaceBackground>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
            <Screen key={stack.length + route.name} route={route} />
            {childScreen && <CaaFab onPress={openCaa} />}
          </SafeAreaView>
        </SpaceBackground>
        <Modal visible={caaOpen} animationType="slide" onRequestClose={() => setCaaOpen(false)}>
          <SpaceBackground>
            <SafeAreaView style={{ flex: 1 }}>
              <CaaBoard onClose={() => setCaaOpen(false)} />
            </SafeAreaView>
          </SpaceBackground>
        </Modal>
      </NavContext.Provider>
    </SafeAreaProvider>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomeScreen />;
    case 'worlds':
      return <WorldsScreen />;
    case 'world':
      return <WorldMenuScreen id={route.id} />;
    case 'explore':
      return <ExploreScreen id={route.id} />;
    case 'find':
      return <FindGameScreen id={route.id} />;
    case 'match':
      return <MatchGameScreen id={route.id} />;
    case 'calm':
      return <CalmScreen />;
    case 'parent':
      return <ParentScreen />;
  }
}

/** Bouton CAA flottant : la communication est accessible depuis tous les écrans enfant. */
function CaaFab({ onPress }: { onPress: () => void }) {
  const p = usePalette();
  const lang = useStore().settings.lang;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir la communication"
      style={[styles.fab, { backgroundColor: p.accent, shadowColor: p.accent }]}
    >
      <Text style={{ fontSize: 30 }}>💬</Text>
      <Text style={{ fontSize: 13, fontWeight: '800', color: '#07102A' }}>{t(lang).talk}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
});
