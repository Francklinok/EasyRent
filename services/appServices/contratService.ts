
import { database } from '@/components/database';
import { queueManager } from '../manager/queueManager';
import { connectivityManager } from '../manager/connectivityManager';
import { apiService } from '../api/apiService';
import { Contract } from '../types';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const CONTRACTS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/contracts`;

export class ContractService {
  async initialize(): Promise<void> {
    // Créer les répertoires nécessaires
    const exists = await RNFS.exists(CONTRACTS_DIRECTORY);
    if (!exists) {
      await RNFS.mkdir(CONTRACTS_DIRECTORY);
    }
  }

  async createContract(contractData: Omit<Contract, 'id' | 'documentPath' | 'createdAt' | 'updatedAt' | 'syncStatus'>, htmlTemplate: string): Promise<Contract> {
    // Vérifier la connectivité
    const isConnected = await connectivityManager.isConnected();
    
    try {
      // Générer le PDF du contrat
      const pdfFile = await this.generateContractPDF(htmlTemplate, contractData);
      
      // Créer le contrat dans la base de données locale
      const contractsCollection = database.get('contracts');
      let newContract;
      
      await database.action(async () => {
        newContract = await contractsCollection.create((contract: any) => {
          contract.title = contractData.title;
          contract.property_id = contractData.propertyId;
          contract.seller_id = contractData.sellerId;
          contract.buyer_id = contractData.buyerId;
          contract.status = contractData.status;
          contract.document_path = pdfFile.filePath;
          contract.amount = contractData.amount;
          contract.start_date = contractData.startDate;
          contract.end_date = contractData.endDate;
          contract.is_signed = contractData.isSigned || false;
          contract.sync_status = isConnected ? 'synced' : 'pending';
          contract.created_at = new Date();
          contract.updated_at = new Date();
        });
      });
      
      // Convertir le modèle en objet
      const contractObj: Contract = {
        id: newContract.id,
        title: newContract.title,
        propertyId: newContract.property_id,
        sellerId: newContract.seller_id,
        buyerId: newContract.buyer_id,
        status: newContract.status,
        documentPath: newContract.document_path,
        amount: newContract.amount,
        startDate: newContract.start_date,
        endDate: newContract.end_date,
        isSigned: newContract.is_signed,
        createdAt: newContract.created_at,
        updatedAt: newContract.updated_at,
        syncStatus: {
          status: newContract.sync_status,
          lastSyncAt: newContract.last_sync_at,
          errorMessage: newContract.sync_error
        }
      };
      
      // Si connecté, synchroniser avec le serveur
      if (isConnected) {
        try {
          // Créer un FormData pour télécharger le PDF
          const formData = new FormData();
          
          Object.entries(contractData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          
          // Ajouter le fichier PDF
          formData.append('document', {
            uri: `file://${pdfFile.filePath}`,
            type: 'application/pdf',
            name: `contract_${newContract.id}.pdf`
          });
          
          // Envoyer au serveur
          const response = await apiService.post('/contracts', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          
          // Mettre à jour avec l'ID serveur
          await database.action(async () => {
            await newContract.update((contract: any) => {
              contract.server_id = response.id;
              contract.sync_status = 'synced';
              contract.last_sync_at = new Date();
            });
          });
          
          contractObj.serverId = response.id;
        } catch (error) {
          console.error('Error syncing contract:', error);
          
          // Marquer comme en attente en cas d'erreur
          await database.action(async () => {
            await newContract.update((contract: any) => {
              contract.sync_status = 'pending';
              contract.sync_error = error.message;
            });
          });
          
          // Ajouter à la file d'attente pour synchronisation ultérieure
          await queueManager.addToQueue({
            type: 'CREATE_CONTRACT',
            entity: 'contracts',
            data: contractObj,
            endpoint: '/contracts',
            method: 'POST'
          });
        }
      } else {
        // Si hors ligne, ajouter à la file d'attente
        await queueManager.addToQueue({
          type: 'CREATE_CONTRACT',
          entity: 'contracts',
          data: contractObj,
          endpoint: '/contracts',
          method: 'POST'
        });
      }
      
      return contractObj;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  private async generateContractPDF(htmlTemplate: string, contractData: any): Promise<{ filePath: string, base64: string }> {
    try {
      // S'assurer que le répertoire existe
      await this.initialize();
      
      // Remplacer les placeholders dans le template
      let html = htmlTemplate;
      Object.entries(contractData).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(placeholder, String(value));
      });
      
      // Ajouter la date de génération
      const date = new Date().toLocaleDateString('fr-FR');
      html = html.replace(/{{generationDate}}/g, date);
      
      // Générer le PDF
      const fileName = `contract_${uuidv4()}.pdf`;
      const filePath = `${CONTRACTS_DIRECTORY}/${fileName}`;
      
      const options = {
        html,
        fileName,
        directory: 'Documents',
        base64: true,
      };
      
      const pdf = await RNHTMLtoPDF.convert(options);
      
      // Vérifier si la génération a réussi
      if (!pdf.filePath) {
        throw new Error('Failed to generate PDF');
      }
      
      // Déplacer le fichier vers notre répertoire spécifique
      await RNFS.moveFile(pdf.filePath, filePath);
      
      return {
        filePath,
        base64: pdf.base64 || ''
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

        
        async getContract(contractId: string): Promise<Contract | null> {
            try {
            const contract = await database.get('contracts').find(contractId);
            
            return {
                id: contract.id,
                serverId: contract.server_id,
                title: contract.title,
                propertyId: contract.property_id,
                sellerId: contract.seller_id,
                buyerId: contract.buyer_id,
                status: contract.status,
                documentPath: contract.document_path,
                amount: contract.amount,
                startDate: contract.start_date,
                endDate: contract.end_date,
                isSigned: contract.is_signed,
                createdAt: contract.created_at,
                updatedAt: contract.updated_at,
                syncStatus: {
                status: contract.sync_status,
                lastSyncAt: contract.last_sync_at,
                errorMessage: contract.sync_error
                }
            };
            } catch (error) {
            console.error('Error fetching contract:', error);
            return null;
            }
        }
        
        async updateContractStatus(contractId: string, status: string, isSigned: boolean = false): Promise<boolean> {
            const isConnected = await connectivityManager.isConnected();
            
            try {
            // Mettre à jour localement
            const contractsCollection = database.get('contracts');
            let updatedContract;
            
            await database.action(async () => {
                const contract = await contractsCollection.find(contractId);
                updatedContract = await contract.update((c: any) => {
                c.status = status;
                
                if (isSigned) {
                    c.is_signed = true;
                }
                
                c.sync_status = isConnected ? 'synced' : 'pending';
                c.updated_at = new Date();
                });
            });
            
            // Convertir le modèle en objet pour la file d'attente
            const contractObj = {
                id: updatedContract.id,
                serverId: updatedContract.server_id,
                status: status,
                isSigned: isSigned
            };
            
            // Si connecté, synchroniser avec le serveur
            if (isConnected) {
                try {
                // Appel API au serveur
                await apiService.patch(
                    `/contracts/${updatedContract.server_id || updatedContract.id}/status`, 
                    { status, is_signed: isSigned }
                );
                
                // Mettre à jour le statut de synchronisation
                await database.action(async () => {
                    await updatedContract.update((c: any) => {
                    c.sync_status = 'synced';
                    c.last_sync_at = new Date();
                    c.sync_error = null;
                    });
                });
                
                return true;
                } catch (error) {
                console.error('Error syncing contract status update:', error);
                
                // Marquer comme en attente en cas d'erreur
                await database.action(async () => {
                    await updatedContract.update((c: any) => {
                    c.sync_status = 'pending';
                    c.sync_error = error.message;
                    });
                });
                
                // Ajouter à la file d'attente pour synchronisation ultérieure
                await queueManager.addToQueue({
                    type: 'UPDATE_CONTRACT_STATUS',
                    entity: 'contracts',
                    data: contractObj,
                    endpoint: `/contracts/${updatedContract.server_id || updatedContract.id}/status`,
                    method: 'PATCH'
                });
                }
            } else {
                // Si hors ligne, ajouter à la file d'attente
                await queueManager.addToQueue({
                type: 'UPDATE_CONTRACT_STATUS',
                entity: 'contracts',
                data: contractObj,
                endpoint: `/contracts/${updatedContract.server_id || updatedContract.id}/status`,
                method: 'PATCH'
                });
            }
            
            return true;
            } catch (error) {
            console.error('Error updating contract status:', error);
            return false;
            }
        }
        
        async listContractsByUser(userId: string, role: 'buyer' | 'seller', status?: string): Promise<Contract[]> {
            try {
            const contractsCollection = database.get('contracts');
            let query;
            
            if (role === 'buyer') {
                query = contractsCollection.query(Q.where('buyer_id', userId));
            } else {
                query = contractsCollection.query(Q.where('seller_id', userId));
            }
            
            // Ajouter un filtre de statut si fourni
            if (status) {
                query = query.extend(Q.where('status', status));
            }
            
            // Trier par date de création décroissante
            query = query.extend(Q.sortBy('created_at', Q.desc));
            
            const contracts = await query.fetch();
            
            // Convertir les modèles en objets
            return contracts.map(contract => ({
                id: contract.id,
                serverId: contract.server_id,
                title: contract.title,
                propertyId: contract.property_id,
                sellerId: contract.seller_id,
                buyerId: contract.buyer_id,
                status: contract.status,
                documentPath: contract.document_path,
                amount: contract.amount,
                startDate: contract.start_date,
                endDate: contract.end_date,
                isSigned: contract.is_signed,
                createdAt: contract.created_at,
                updatedAt: contract.updated_at,
                syncStatus: {
                status: contract.sync_status,
                lastSyncAt: contract.last_sync_at,
                errorMessage: contract.sync_error
                }
            }));
            } catch (error) {
            console.error('Error listing contracts:', error);
            return [];
            }
        }
        
        async addAttachmentToContract(contractId: string, fileUri: string, fileName: string, fileType: string): Promise<boolean> {
            try {
            // S'assurer que le répertoire existe
            await this.initialize();
            
            // Générer un nom de fichier unique
            const fileExt = fileUri.split('.').pop() || '';
            const uniqueFileName = `${uuidv4()}.${fileExt}`;
            const localPath = `${CONTRACTS_DIRECTORY}/${uniqueFileName}`;
            
            // Copier le fichier vers le stockage local
            await RNFS.copyFile(fileUri, localPath);
            
            // Vérifier la connectivité
            const isConnected = await connectivityManager.isConnected();
            
            // Ajouter la pièce jointe à la base de données locale
            const attachmentsCollection = database.get('contract_attachments');
            
            await database.action(async () => {
                await attachmentsCollection.create((attachment: any) => {
                attachment.contract_id = contractId;
                attachment.local_path = localPath;
                attachment.name = fileName;
                attachment.type = fileType;
                attachment.sync_status = isConnected ? 'synced' : 'pending';
                attachment.created_at = new Date();
                attachment.updated_at = new Date();
                });
            });
            
            // Si connecté, synchroniser avec le serveur
            if (isConnected) {
                try {
                // Obtenir le contrat pour l'ID serveur
                const contract = await this.getContract(contractId);
                
                // Créer un FormData pour télécharger le fichier
                const formData = new FormData();
                formData.append('contract_id', contract?.serverId || contractId);
                formData.append('name', fileName);
                formData.append('type', fileType);
                formData.append('file', {
                    uri: `file://${localPath}`,
                    type: fileType,
                    name: fileName
                });
                
                // Envoyer au serveur
                await apiService.post('/contract-attachments', formData, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    }
                });
                
                return true;
                } catch (error) {
                console.error('Error syncing contract attachment:', error);
                
                // Ajouter à la file d'attente pour synchronisation ultérieure
                await queueManager.addToQueue({
                    type: 'UPLOAD_CONTRACT_ATTACHMENT',
                    entity: 'contract_attachments',
                    data: {
                    contractId,
                    localPath,
                    name: fileName,
                    type: fileType
                    },
                    endpoint: '/contract-attachments',
                    method: 'POST'
                });
                }
            } else {
                // Si hors ligne, ajouter à la file d'attente
                await queueManager.addToQueue({
                type: 'UPLOAD_CONTRACT_ATTACHMENT',
                entity: 'contract_attachments',
                data: {
                    contractId,
                    localPath,
                    name: fileName,
                    type: fileType
                },
                endpoint: '/contract-attachments',
                method: 'POST'
                });
            }
            
            return true;
            } catch (error) {
            console.error('Error adding attachment to contract:', error);
            return false;
            }
        }
        }
        
        export const contractService = new ContractService();