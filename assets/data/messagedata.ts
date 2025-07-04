const messageData = [
  {
    id: '1',
    sender: {
      name: 'EasyBot',
      avatar: 'https://ui-avatars.com/api/?name=Easy+Bot&background=random',
    },
    content: 'Bonjour, comment puis-je vous aider aujourd’hui ?',
    timestamp: '09:15',
    isBot: true,
    status: 'En ligne',
    count: 2,
    statusIcon: 'read', // ✔✔ bleu
    isSentByCurrentUser: false,
  },
  {
    id: '2',
    sender: {
      name: 'Aline Dossou',
      avatar: 'https://ui-avatars.com/api/?name=Aline+Dossou',
    },
    content: 'Merci pour les photos ! Je vais en discuter avec mon mari.',
    timestamp: '10:42',
    isBot: false,
    status: 'En ligne',
    count: 0,
    statusIcon: 'read',
    isSentByCurrentUser: true,
  },
  {
    id: '3',
    sender: {
      name: 'Julien K.',
      avatar: 'https://ui-avatars.com/api/?name=Julien+K',
    },
    content: 'Je suis en train d’écrire un message...',
    timestamp: '11:02',
    isBot: false,
    status: 'En train d’écrire…',
    count: 1,
    statusIcon: 'delivered', // ✔✔ gris
    isSentByCurrentUser: true,
  },
  {
    id: '4',
    sender: {
      name: 'Agence Immo+',
      avatar: 'https://ui-avatars.com/api/?name=Agence+Immo',
    },
    content: 'Le propriétaire souhaite une visite demain à 17h.',
    timestamp: 'Hier',
    isBot: false,
    status: '',
    count: 0,
    statusIcon: 'sent', // ✔
    isSentByCurrentUser: true,
  },
  {
    id: '5',
    sender: {
      name: 'Assistant IA',
      avatar: 'https://ui-avatars.com/api/?name=Assistant+IA&background=0D8ABC&color=fff',
    },
    content: 'Voici les documents générés automatiquement.',
    timestamp: '08:30',
    isBot: true,
    status: 'Disponible',
    count: 4,
    statusIcon: 'read',
    isSentByCurrentUser: false,
  },
];

export default messageData;
