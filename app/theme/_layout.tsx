import React from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { Palette } from 'lucide-react-native';

export default function ThemeLayout() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets().top;

    const renderHeader = () => (
        <ThemedView
            style={{
                paddingHorizontal: 16,
                paddingTop: insets + 10,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline + '80',
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
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Palette size={16} color="white" strokeWidth={2.5} />
                        </ThemedView>
                        <ThemedText type="subtitle" intensity="strong" style={{ color: theme.text }}>
                            Thème
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {/* Right: Info icon */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.surface,
                        borderRadius: 20,
                        padding: 8,
                    }}
                >
                    <MaterialCommunityIcons name="information-outline" size={20} color= {theme.text} />
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
