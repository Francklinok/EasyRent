import React from 'react';
import { Slot, router } from 'expo-router';
import { TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'moti';
export default function ServiceLayout() {
    const insets = useSafeAreaInsets();

    return (
        <View   style={{ flex: 1,backgroundColor:"transparent" }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header Actions - positioned absolute over content */}
            <View style={[styles.headerActions, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.glassButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassButton}>
                    <Ionicons name="share-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <Slot />
        </View>
    );
}

const styles = StyleSheet.create({
    headerActions: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        zIndex: 100,
    },
    glassButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
