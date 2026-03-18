import React, { useState } from 'react';
import { Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { BackButton } from '@/components/ui/BackButton';

const AIAssistantSettings = () => {
  const { theme } = useTheme();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedScrollView>

        <ThemedView style={{ padding: 16, paddingTop:10}}>
           <ThemedText type ="normaltitle">
        Assistance 
      </ThemedText>
          <ThemedView style={{ borderRadius: 12, gap:10,  paddingTop:6 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 4, paddingTop:0, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor:theme.secondary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="robot" size={20} color={theme.secondary}/>
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText  type ="normal">Activer l'IA</ThemedText>
                <ThemedText type ="caption" intensity ="light">Assistant intelligent</ThemedText>
              </ThemedView>
              <Switch
                value={aiEnabled}
                onValueChange={setAiEnabled}
                trackColor={{ false: theme.outline + '40', true: theme.secondary + '40' }}
                thumbColor={aiEnabled ? theme.secondary : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 4, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="microphone" size={20} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText type ="normal">Commandes vocales</ThemedText>
                <ThemedText type ="caption" intensity ="light">Parler à l'assistant</ThemedText>
              </ThemedView>
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                trackColor={{ false: theme.outline + '40', true: theme.primary + '40' }}
                thumbColor={voiceEnabled ? theme.primary : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 4, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.success + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="lightbulb" size={20} color={theme.success} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText type ="normal">Suggestions</ThemedText>
                <ThemedText type ="caption" intensity ="light">Recommandations IA</ThemedText>
              </ThemedView>
              <Switch
                value={suggestions}
                onValueChange={setSuggestions}
                trackColor={{ false: theme.outline + '40', true: theme.success + '40' }}
                thumbColor={suggestions ? theme.success : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
              <ThemedView style={{ backgroundColor: theme.secondary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="auto-fix" size={20} color={theme.secondary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText type ="normal">Auto-complétion</ThemedText>
                <ThemedText type ="caption" intensity ="light">Terminer vos phrases</ThemedText>
              </ThemedView>
              <Switch
                value={autoComplete}
                onValueChange={setAutoComplete}
                trackColor={{ false: theme.outline + '40', true: theme.secondary + '40' }}
                thumbColor={autoComplete ? theme.secondary : theme.outline}
              />
            </ThemedView>
          </ThemedView>
          
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default AIAssistantSettings;
