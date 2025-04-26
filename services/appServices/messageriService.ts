
// src/services/messageService.ts
import { database } from '../database';
import { queueManager } from './queueManager';
import { connectivityManager } from './connectivityManager';
import { apiService } from './apiService';
import { Message, MessageAttachment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';

const MESSAGE_MEDIA_DIRECTORY = `${RNFS.DocumentDirectoryPath}/message_attachments`;

export class MessageService {
  async initialize(): Promise<void> {
    // Créer les répertoires nécessaires
    const exists = await RNFS.exists(MESSAGE_MEDIA_DIRECTORY);
    if (!exists) {
      await RNFS.mkdir(MESSAGE_MEDIA_DIRECTORY);
    }
  }

  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'attachments'>, attachments?: { uri: string, type: 'image' | 'document' | 'audio' | 'video', name: string }[]): Promise<Message> {
    // Vérifier la connectivité
    const isConnected = await connectivityManager.isConnected();
    
    try {
      // Créer d'abord le message localement
      const messagesCollection = database.get('messages');
      let newMessage;
      
      await database.action(async () => {
        newMessage = await messagesCollection.create((msg: any) => {
          msg.sender_id = message.senderId;
          msg.receiver_id = message.receiverId;
          msg.property_id = message.propertyId;
          msg.content = message.content;
          msg.is_read = message.isRead || false;
          msg.sync_status = isConnected ? 'synced' : 'pending';
          msg.created_at = new Date();
          msg.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet
      const messageObj: Message = {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        receiverId: newMessage.receiver_id,
        propertyId: newMessage.property_id,
        content: newMessage.content,
        isRead: newMessage.is_read,
        createdAt: newMessage.created_at,
        updatedAt: newMessage.updated_at,
        syncStatus: {
          status: newMessage.sync_status,
          lastSyncAt: newMessage.last_sync_at,
          errorMessage: newMessage.sync_error
        },
        attachments: []
      };
      
      // Traiter les pièces jointes si présentes
      if (attachments && attachments.length > 0) {
        const processedAttachments = await Promise.all(
          attachments.map(attachment => this.processAttachment(newMessage.id, attachment))
        );
        
        messageObj.attachments = processedAttachments.filter(Boolean) as MessageAttachment[];
      }
      
      // Si connecté, synchroniser avec le serveur
      if (isConnected) {
        try {
          // Préparer les données pour l'API
          const apiData = {
            sender_id: message.senderId,
            receiver_id: message.receiverId,
            property_id: message.propertyId,
            content: message.content,
            is_read: message.isRead || false,
            attachments: messageObj.attachments?.map(att => ({
              local_path: att.localPath,
              type: att.type,
              name: att.name,
              size: att.size
            }))
          };
          
          // Envoyer au serveur
          const response = await apiService.post('/messages', apiData);
          
          // Mettre à jour avec l'ID serveur
          await database.action(async () => {
            await newMessage.update((msg: any) => {
              msg.server_id = response.id;
              msg.sync_status = 'synced';
              msg.last_sync_at = new Date();
            });
          });
          
          messageObj.serverId = response.id;
        } catch (error) {
          console.error('Error syncing message:', error);
          
          // Marquer comme en attente en cas d'erreur
          await database.action(async () => {
            await newMessage.update((msg: any) => {
              msg.sync_status = 'pending';
              msg.sync_error = error.message;
            });
          });
          
          // Ajouter à la file d'attente pour synchronisation ultérieure
          await queueManager.addToQueue({
            type: 'SEND_MESSAGE',
            entity: 'messages',
            data: messageObj,
            endpoint: '/messages',
            method: 'POST'
          });
        }
      } else {
        // Si hors ligne, ajouter à la file d'attente
        await queueManager.addToQueue({
          type: 'SEND_MESSAGE',
          entity: 'messages',
          data: messageObj,
          endpoint: '/messages',
          method: 'POST'
        });
      }
      
      return messageObj;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private async processAttachment(messageId: string, attachment: { uri: string, type: 'image' | 'document' | 'audio' | 'video', name: string }): Promise<MessageAttachment | null> {
    try {
      // Créer un répertoire pour les pièces jointes si nécessaire
      await this.initialize();
      
      // Générer un nom de fichier unique
      const fileExt = attachment.uri.split('.').pop() || '';
      const fileName = `${uuidv4()}.${fileExt}`;
      const localPath = `${MESSAGE_MEDIA_DIRECTORY}/${fileName}`;
      
      // Copier le fichier vers le stockage local
      await RNFS.copyFile(attachment.uri, localPath);
      
      // Obtenir la taille du fichier
      const fileStats = await RNFS.stat(localPath);
      
      // Ajouter à la base de données locale
      const attachmentsCollection = database.get('message_attachments');
      let newAttachment;
      
      await database.action(async () => {
        newAttachment = await attachmentsCollection.create((att: any) => {
          att.message_id = messageId;
          att.local_path = localPath;
          att.type = attachment.type;
          att.name = attachment.name;
          att.size = fileStats.size;
          att.sync_status = 'pending';
          att.created_at = new Date();
          att.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet
      return {
        id: newAttachment.id,
        messageId: newAttachment.message_id,
        localPath: newAttachment.local_path,
        type: newAttachment.type,
        name: newAttachment.name,
        size: newAttachment.size,
        createdAt: newAttachment.created_at,
        updatedAt: newAttachment.updated_at,
        syncStatus: {
          status: newAttachment.sync_status,
          lastSyncAt: newAttachment.last_sync_at,
          errorMessage: newAttachment.sync_error
        }
      };
    } catch (error) {
      console.error('Error processing attachment:', error);
      return null;
    }
  }
  
  async getConversation(userId1: string, userId2: string, page = 1, limit = 20): Promise<Message[]> {
    try {
      const messagesCollection = database.get('messages');
      
      // Requête complexe pour obtenir les messages entre deux utilisateurs
      const messages = await messagesCollection
        .query(
          Q.or(
            Q.and(
              Q.where('sender_id', userId1),
              Q.where('receiver_id', userId2)
            ),
            Q.and(
              Q.where('sender_id', userId2),
              Q.where('receiver_id', userId1)
            )
          ),
          Q.sortBy('created_at', Q.desc),
          Q.skip((page - 1) * limit),
          Q.take(limit)
        )
        .fetch();
      
      // Conversion en objets
      const messageObjects = await Promise.all(
        messages.map(async (message) => {
          // Récupérer les pièces jointes pour chaque message
          const attachments = await message.attachments.fetch();
          
          return {
            id: message.id,
            serverId: message.server_id,
            senderId: message.sender_id,
            receiverId: message.receiver_id,
            propertyId: message.property_id,
            content: message.content,
            isRead: message.is_read,
            createdAt: message.created_at,
            updatedAt: message.updated_at,
            syncStatus: {
              status: message.sync_status,
              lastSyncAt: message.last_sync_at,
              errorMessage: message.sync_error
            },
            attachments: attachments.map(att => ({
              id: att.id,
              messageId: att.message_id,
              localPath: att.local_path,
              remoteUrl: att.remote_url,
              type: att.type,
              name: att.name,
              size: att.size,
              createdAt: att.created_at,
              updatedAt: att.updated_at,
              syncStatus: {
                status: att.sync_status,
                lastSyncAt: att.last_sync_at,
                errorMessage: att.sync_error
              }
            }))
          };
        })
      );
      
      return messageObjects;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  }
  
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const messagesCollection = database.get('messages');
      const message = await messagesCollection.find(messageId);
      
      // Vérifier si déjà lu
      if (message.is_read) {
        return true;
      }
      
      // Mettre à jour localement
      await database.action(async () => {
        await message.update((msg: any) => {
          msg.is_read = true;
          msg.updated_at = new Date();
          msg.sync_status = 'pending';
        });
      });
      
      // Ajouter à la file d'attente
      await queueManager.addToQueue({
        type: 'MARK_MESSAGE_READ',
        entity: 'messages',
        data: { id: messageId, isRead: true },
        endpoint: `/messages/${message.server_id || messageId}/read`,
        method: 'PATCH'
      });
      
      // Tenter de synchroniser immédiatement si connecté
      const isConnected = await connectivityManager.isConnected();
      if (isConnected) {
        await connectivityManager.triggerSync();
      }
      
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }
}

export const messageService = new MessageService();
