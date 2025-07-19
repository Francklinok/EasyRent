
import React, { useState } from 'react';
import { FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Header from '@/components/ui/header';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/contexts/theme/themehook';
import messageData from '@/assets/data/messagedata';
export default function ChatList() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const filteredMessages = messageData.filter((item) =>
    item.sender.name.toLowerCase().includes(search.toLowerCase()) ||
    item.content.toLowerCase().includes(search.toLowerCase())
  );

  // const rightHeaderElement = (
  //   <ThemedView className="flex-row items-center gap-3">
  //     <TouchableOpacity onPress={() => {}}>
  //       <Ionicons name="search-outline" size={24} color={theme.onSurface} />
  //     </TouchableOpacity>
  //   </ThemedView>
  // );

  return (
    <ThemedView className="flex-1">
      <Header rightElement={null} />

      {/* 🔍 Barre de recherche */}
      <ThemedView
        className="my-2 mx-4 px-3 py-1 rounded-xl flex-row items-center"
        style={{ backgroundColor: theme.surfaceVariant }}
      >
        <Ionicons name="search-outline" size={20} color={theme.onSurface} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un message ou un nom"
          placeholderTextColor={theme.onSurface + '99'}
          className="ml-2 flex-1 text-base"
          style={{ color: theme.onSurface }}
        />
      </ThemedView>

      <ThemedView backgroundColor = "onSurface" className="flex-1 px-3">
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname: '/chat/[chatId]',
                  params: {
                    chatId: item.id,
                    name: item.sender.name,
                    image: item.sender.avatar,
                  },
                })
              }
              activeOpacity={0.85}
              className="mb-2"
            >
              <AnimatePresence>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 10 }}
                  transition={{ type: 'timing', duration: 300 }}
                >
                  <ThemedView
                    className="flex-row items-center px-3 py-3 rounded-2xl"
                    style={{
                      backgroundColor: theme.surfaceVariant,
                      shadowColor: theme.onSurface,
                      shadowOpacity: 0.08,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    {/* 👤 Avatar stylisé */}
                    <ThemedView
                      className="w-14 h-14 rounded-full overflow-hidden mr-3"
                      style={{
                        borderColor: theme.primary,
                        borderWidth: 0.5,
                        shadowColor: theme.primary,
                        shadowRadius: 6,
                        shadowOpacity: 0.15,
                        shadowOffset: { width: 0, height: 2 },
                      }}
                    >
                      <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                    </ThemedView>

                    {/* 📄 Contenu texte */}
                    <ThemedView backgroundColor = "onSurface" className="flex-1">
                      <ThemedText intensity="strong" className="text-base font-semibold">
                        {item.sender.name}
                      </ThemedText>
                      <ThemedText type="caption" numberOfLines={1} className="text-sm text-muted">
                        {item.content}
                      </ThemedText>

                      {/* 🎨 Statut (en ligne / écriture) */}
                      {item.status && (
                        <ThemedText type="caption" className="text-xs text-green-500 mt-0.5">
                          {item.status}
                        </ThemedText>
                      )}
                    </ThemedView>

                    {/* 🕒 Heure + 🧠 IA + 🔵 Badge + ✔ Statut */}
                    <ThemedView backgroundColor = "onSurface" className="items-end ml-2 min-w-[60px]">
                      <ThemedText type="caption" className="text-xs text-muted">
                        {item.timestamp}
                      </ThemedText>

                      {/* 🧠 Badge IA */}
                      {/* {item.isBot && (
                        <ThemedView
                          className="mt-1 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <ThemedText type="caption" className="text-white text-xs">
                            IA
                          </ThemedText>
                        </ThemedView>
                      )} */}

                      {/* 💬 Badge message non lu animé */}
                      {item.count > 0 && (
                        <MotiView
                          from={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring' }}
                          className="mt-1"
                        >
                          <ThemedView
                            className="px-2 border rounded-full items-center justify-center"
                            style={{ backgroundColor: theme.star }}
                          >
                            <ThemedText
                              type="caption"
                              className="text-xs text-white font-bold"
                            >
                              {item.count}
                            </ThemedText>
                          </ThemedView>
                        </MotiView>
                      )}

                      {/* ✔ Statut de message envoyé */}
                      {item.isSentByCurrentUser && (
                        <ThemedText type="caption" className="text-xs mt-1">
                          {item.statusIcon === 'sent' && '✔'}
                          {item.statusIcon === 'delivered' && '✔✔'}
                          {item.statusIcon === 'read' && (
                            <ThemedText
                              type="caption"
                              className="text-xs"
                              style={{ color: theme.success }}
                            >
                              ✔✔
                            </ThemedText>
                          )}
                        </ThemedText>
                      )}
                    </ThemedView>
                  </ThemedView>
                </MotiView>
              </AnimatePresence>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </ThemedView>
  );
}
