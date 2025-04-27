export interface SyncStatus {
  status: 'pending' | 'synced' | 'error';
  lastSyncAt?: Date;
  errorMessage?: string;
}

export interface BaseModel {
  id: string;
  serverId?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export interface Property extends BaseModel {

  title: string;
  description: string;
  address: string;
  monthlyRent: number;
  depositAmount: number;
  maxOccupants: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  ownerId: string;
  amenities?: string[];
  availableFrom: Date;
  createdAt: Date;
  type: string;
  surface: number;
  rooms: number;
  latitude?: number;
  longitude?: number;
  images: PropertyImage[];

}

export interface PropertyImage extends BaseModel {
  propertyId: string;
  localPath: string;
  remoteUrl?: string;
  isPrimary: boolean;
  order: number;
}

export interface Message extends BaseModel {
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment extends BaseModel {
  messageId: string;
  localPath: string;
  remoteUrl?: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  size: number;
}

export interface User extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Contract extends BaseModel {
  title: string;
  propertyId: string;
  sellerId: string;
  buyerId: string;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired';
  documentPath: string;
  amount: number;
  startDate?: Date;
  endDate?: Date;
  isSigned: boolean;
}

export interface QueuedAction<T = any> {
  id: string;
  type: string;
  entity: string;
  data: T;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timestamp: number;
  retries: number;
  priority: number;
}
