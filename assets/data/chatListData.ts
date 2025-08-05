import { ChatListItem } from '@/types/ChatListTypes';

const chatListData: ChatListItem[] = [
  {
    id: '1',
    sender: {
      name: 'EasyBot',
      avatar: 'https://ui-avatars.com/api/?name=Easy+Bot&background=random',
    },
    content: 'Bonjour, comment puis-je vous aider aujourd\'hui ?',
    timestamp: '10:30',
    count: 2,
    isArchived: false,
    status: 'online',
    isBot: true,
    isSentByCurrentUser: false,
    statusIcon: 'read'
  },
  {
    id: '2',
    sender: {
      name: 'Aline Dossou',
      avatar: 'https://ui-avatars.com/api/?name=Aline+Dossou',
    },
    content: 'Merci pour les photos ! Je vais en discuter avec mon mari.',
    timestamp: '09:45',
    count: 0,
    isArchived: false,
    status: 'online',
    isBot: false,
    isSentByCurrentUser: true,
    statusIcon: 'delivered'
  },
  {
    id: '3',
    sender: {
      name: 'Agent Immo',
      avatar: 'https://ui-avatars.com/api/?name=Agent+Immo',
    },
    content: 'Ce bien est encore disponible. Souhaitez-vous planifier une visite ?',
    timestamp: '08:20',
    count: 1,
    isArchived: false,
    status: 'away',
    isBot: false,
    isSentByCurrentUser: false,
    statusIcon: 'sent'
  },
  {
    id: '4',
    sender: {
      name: 'Marie Dupont',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Dupont',
    },
    content: 'Parfait, je vous envoie la confirmation dans quelques minutes.',
    timestamp: 'Hier',
    count: 0,
    isArchived: false,
    status: 'offline',
    isBot: false,
    isSentByCurrentUser: true,
    statusIcon: 'read'
  },
  {
    id: '5',
    sender: {
      name: 'Support Client',
      avatar: 'https://ui-avatars.com/api/?name=Support+Client',
    },
    content: 'Votre demande a été traitée avec succès.',
    timestamp: 'Lun',
    count: 0,
    isArchived: true,
    status: 'online',
    isBot: true,
    isSentByCurrentUser: false,
    statusIcon: 'delivered'
  }
];

export default chatListData;