
// src/services/propertyService.ts
import { database } from '../database';
import { queueManager } from './queueManager';
import { connectivityManager } from './connectivityManager';
import { apiService } from './apiService';
import { Property, PropertyImage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

const MEDIA_DIRECTORY = `${RNFS.DocumentDirectoryPath}/property_images`;

export class PropertyService {
  async initialize(): Promise<void> {
    // Créer les répertoires nécessaires
    const exists = await RNFS.exists(MEDIA_DIRECTORY);
    if (!exists) {
      await RNFS.mkdir(MEDIA_DIRECTORY);
    }
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'images'>): Promise<Property> {
    // Vérifier la connectivité
    const isConnected = await connectivityManager.isConnected();
    
    try {
      // Créer d'abord localement
      const propertiesCollection = database.get('properties');
      let newProperty;
      
      await database.action(async () => {
        newProperty = await propertiesCollection.create((property: any) => {
          property.title = propertyData.title;
          property.description = propertyData.description;
          property.address = propertyData.address;
          property.price = propertyData.price;
          property.type = propertyData.type;
          property.bedrooms = propertyData.bedrooms;
          property.bathrooms = propertyData.bathrooms;
          property.area = propertyData.area;
          property.latitude = propertyData.latitude;
          property.longitude = propertyData.longitude;
          property.owner_id = propertyData.ownerId;
          property.sync_status = isConnected ? 'synced' : 'pending';
          property.created_at = new Date();
          property.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet pour la file d'attente
      const propertyObj = {
        id: newProperty.id,
        title: newProperty.title,
        description: newProperty.description,
        address: newProperty.address,
        price: newProperty.price,
        type: newProperty.type,
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        area: newProperty.area,
        latitude: newProperty.latitude,
        longitude: newProperty.longitude,
        ownerId: newProperty.ownerId,
        createdAt: newProperty.createdAt,
        updatedAt: newProperty.updatedAt,
        syncStatus: newProperty.syncStatus,
        images: []
      };
      
      // Si connecté, synchroniser avec le serveur
      if (isConnected) {
        try {
          // Appel API au serveur
          const response = await apiService.post('/properties', {
            title: propertyData.title,
            description: propertyData.description,
            address: propertyData.address,
            price: propertyData.price,
            type: propertyData.type,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            area: propertyData.area,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude,
            owner_id:// Suite de propertyService.ts
            owner_id: propertyData.ownerId,
          });
          
          // Mettre à jour l'ID serveur localement
          await database.action(async () => {
            await newProperty.update((property: any) => {
              property.server_id = response.id;
              property.sync_status = 'synced';
              property.last_sync_at = new Date();
            });
          });
          
          propertyObj.serverId = response.id;
        } catch (error) {
          console.error('Error syncing property:', error);
          
          // Marquer comme en attente en cas d'erreur
          await database.action(async () => {
            await newProperty.update((property: any) => {
              property.sync_status = 'pending';
              property.sync_error = error.message;
            });
          });
          
          // Ajouter à la file d'attente pour synchronisation ultérieure
          await queueManager.addToQueue({
            type: 'CREATE_PROPERTY',
            entity: 'properties',
            data: propertyObj,
            endpoint: '/properties',
            method: 'POST'
          });
        }
      } else {
        // Si hors ligne, ajouter à la file d'attente
        await queueManager.addToQueue({
          type: 'CREATE_PROPERTY',
          entity: 'properties',
          data: propertyObj,
          endpoint: '/properties',
          method: 'POST'
        });
      }
      
      return propertyObj;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(propertyId: string, updateData: Partial<Property>): Promise<Property> {
    const isConnected = await connectivityManager.isConnected();
    
    try {
      // Mettre à jour localement
      const propertiesCollection = database.get('properties');
      let updatedProperty;
      
      await database.action(async () => {
        const property = await propertiesCollection.find(propertyId);
        updatedProperty = await property.update((p: any) => {
          Object.entries(updateData).forEach(([key, value]) => {
            // Convertir camelCase en snake_case
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            p[dbKey] = value;
          });
          
          p.sync_status = isConnected ? 'synced' : 'pending';
          p.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet pour la file d'attente
      const propertyObj = this.convertModelToObject(updatedProperty);
      
      // Si connecté, synchroniser avec le serveur
      if (isConnected) {
        try {
          // Appel API au serveur
          await apiService.put(`/properties/${updatedProperty.serverId || updatedProperty.id}`, propertyObj);
          
          // Mettre à jour le statut de synchronisation
          await database.action(async () => {
            await updatedProperty.update((p: any) => {
              p.sync_status = 'synced';
              p.last_sync_at = new Date();
              p.sync_error = null;
            });
          });
        } catch (error) {
          console.error('Error syncing property update:', error);
          
          // Marquer comme en attente en cas d'erreur
          await database.action(async () => {
            await updatedProperty.update((p: any) => {
              p.sync_status = 'pending';
              p.sync_error = error.message;
            });
          });
          
          // Ajouter à la file d'attente pour synchronisation ultérieure
          await queueManager.addToQueue({
            type: 'UPDATE_PROPERTY',
            entity: 'properties',
            data: propertyObj,
            endpoint: '/properties',
            method: 'PUT'
          });
        }
      } else {
        // Si hors ligne, ajouter à la file d'attente
        await queueManager.addToQueue({
          type: 'UPDATE_PROPERTY',
          entity: 'properties',
          data: propertyObj,
          endpoint: '/properties',
          method: 'PUT'
        });
      }
      
      return propertyObj;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    try {
      const property = await database.get('properties').find(propertyId);
      return this.convertModelToObject(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  async searchProperties(query: Partial<Property>): Promise<Property[]> {
    try {
      const propertiesCollection = database.get('properties');
      let properties = await propertiesCollection.query().fetch();
      
      // Filtrage manuel en JavaScript (pour la flexibilité)
      properties = properties.filter(property => {
        let matches = true;
        
        Object.entries(query).forEach(([key, value]) => {
          // Convertir camelCase en snake_case
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          
          // Vérification du type de comparaison
          if (typeof value === 'string' && typeof property[dbKey] === 'string') {
            // Recherche insensible à la casse pour les chaînes
            if (!property[dbKey].toLowerCase().includes(value.toLowerCase())) {
              matches = false;
            }
          } else if (key === 'price') {
            // Pour le prix, on peut vouloir un intervalle
            if (typeof value === 'object') {
              if (value.min && property[dbKey] < value.min) matches = false;
              if (value.max && property[dbKey] > value.max) matches = false;
            } else if (property[dbKey] !== value) {
              matches = false;
            }
          } else if (property[dbKey] !== value) {
            matches = false;
          }
        });
        
        return matches;
      });
      
      return properties.map(property => this.convertModelToObject(property));
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }

  async uploadPropertyImage(propertyId: string, imageUri: string, isPrimary = false): Promise<PropertyImage | null> {
    try {
      // Créer un répertoire pour les images si nécessaire
      await this.initialize();
      
      // Redimensionner et optimiser l'image
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        1200,  // maxWidth
        1200,  // maxHeight
        'JPEG',
        80,    // qualité
        0,     // rotation
        undefined,
        false,
        { onlyScaleDown: true }
      );
      
      // Créer un nom de fichier unique
      const fileName = `${uuidv4()}.jpg`;
      const localPath = `${MEDIA_DIRECTORY}/${fileName}`;
      
      // Copier l'image vers le stockage local
      await RNFS.copyFile(resizedImage.uri, localPath);
      
      // Vérifier la connectivité
      const isConnected = await connectivityManager.isConnected();
      
      // Ajouter l'image à la base de données locale
      const imagesCollection = database.get('property_images');
      let newImage;
      
      await database.action(async () => {
        newImage = await imagesCollection.create((image: any) => {
          image.property_id = propertyId;
          image.local_path = localPath;
          image.is_primary = isPrimary;
          image.order = Date.now(); // Utilisé pour trier les images
          image.sync_status = isConnected ? 'synced' : 'pending';
          image.created_at = new Date();
          image.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet
      const imageObj = {
        id: newImage.id,
        propertyId: newImage.property_id,
        localPath: newImage.local_path,
        isPrimary: newImage.is_primary,
        order: newImage.order,
        createdAt: newImage.created_at,
        updatedAt: newImage.updated_at,
        syncStatus: {
          status: newImage.sync_status,
          lastSyncAt: newImage.last_sync_at,
          errorMessage: newImage.sync_error
        }
      } as PropertyImage;
      
      // Si connecté, synchroniser avec le serveur
      if (isConnected) {
        try {
          // Créer un FormData pour télécharger l'image
          const formData = new FormData();
          formData.append('property_id', propertyId);
          formData.append('is_primary', isPrimary ? '1' : '0');
          formData.append('order', newImage.order.toString());
          formData.append('image', {
            uri: localPath,
            type: 'image/jpeg',
            name: fileName
          });
          
          // Télécharger l'image
          const response = await apiService.post('/property-images', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          
          // Mettre à jour avec l'ID serveur
          await database.action(async () => {
            await newImage.update((img: any) => {
              img.server_id = response.id;
              img.remote_url = response.url;
              img.sync_status = 'synced';
              img.last_sync_at = new Date();
            });
          });
          
          imageObj.remoteUrl = response.url;
          imageObj.serverId = response.id;
        } catch (error) {
          console.error('Error uploading image:', error);
          
          // Marquer comme en attente en cas d'erreur
          await database.action(async () => {
            await newImage.update((img: any) => {
              img.sync_status = 'pending';
              img.sync_error = error.message;
            });
          });
          
          // Ajouter à la file d'attente pour synchronisation ultérieure
          await queueManager.addToQueue({
            type: 'UPLOAD_IMAGE',
            entity: 'property_images',
            data: imageObj,
            endpoint: '/property-images',
            method: 'POST'
          });
        }
      } else {
        // Si hors ligne, ajouter à la file d'attente
        await queueManager.addToQueue({
          type: 'UPLOAD_IMAGE',
          entity: 'property_images',
          data: imageObj,
          endpoint: '/property-images',
          method: 'POST'
        });
      }
      
      return imageObj;
    } catch (error) {
      console.error('Error processing property image:', error);
      return null;
    }
  }

  private convertModelToObject(model: any): Property {
    return {
      id: model.id,
      serverId: model.server_id,
      title: model.title,
      description: model.description,
      address: model.address,
      price: model.price,
      type: model.type,
      bedrooms: model.bedrooms,
      bathrooms: model.bathrooms,
      area: model.area,
      latitude: model.latitude,
      longitude: model.longitude,
      ownerId: model.owner_id,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      syncStatus: {
        status: model.sync_status,
        lastSyncAt: model.last_sync_at,
        errorMessage: model.sync_error
      },
      images: [] // À remplir si nécessaire
    };
  }
}

export const propertyService = new PropertyService();
