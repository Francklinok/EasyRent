import React from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { Bot } from 'lucide-react-native';
import { useLanguage } from '@/components/contexts/language';

export default function AIAssistantLayout() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets().top;

    const renderHeader = () => (
        <ThemedView
            style={{
                paddingHorizontal: 16,
                paddingTop: insets + 10,
                paddingBottom: 10,
            }}
        >
            <ThemedView style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent',
            }}>
                {/* Left: Back button and title */}
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 12 }}>
                    <BackButton />
                    <ThemedView style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        gap: 8
                    }}>
                        <ThemedView style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Bot size={16} color= {theme.text} strokeWidth={2.5} />
                        </ThemedView>
                        <ThemedText type="subtitle" intensity="strong" style={{ color: theme.text }}>
                          {t('creation.title')}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {/* Right: Help icon */}
                <TouchableOpacity
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 20,
                        padding: 8,
                    }}
                >
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );

    return (
        <ThemedView style={{ flex: 1 }}>
            {renderHeader()}
            <Slot />
        </ThemedView>
    );
}
