// navigationTypes.ts
export type RootStackParamList = {
  ChatList: undefined; // Pas de paramètres pour ChatList
  Chat: { id: string; name: string; image: string }; // Paramètres pour l'écran Chat
};
