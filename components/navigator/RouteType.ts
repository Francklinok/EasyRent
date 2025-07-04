export type RootStackParamList = {
  ChatList: undefined;
  Chat: {
    chatId: string;    
    name: string;
    image: string;
    status?: string;
  };
  ContactInfo: {
    name: string;
    image: string;
    status?: string;
    chatId: string;
  };
};
