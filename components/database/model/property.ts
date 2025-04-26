
// src/database/models/Property.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, children, text, relation } from '@nozbe/watermelondb/decorators';
import { SyncStatus } from '@nozbe/watermelondb/Model';

export default class PropertyModel extends Model {
  static table = 'properties';

  @text('title') title!: string;
  @text('description') description!: string;
  @text('address') address!: string;
  @field('price') price!: number;
  @text('type') type!: string;
  @field('bedrooms') bedrooms?: number;
  @field('bathrooms') bathrooms?: number;
  @field('area') area?: number;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @text('owner_id') ownerId!: string;
  @text('server_id') serverId?: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @text('sync_status') syncStatusRaw!: string;
  @text('sync_error') syncError?: string;
  @date('last_sync_at') lastSyncAt?: Date;

  @children('property_images') images: any;
  @relation('users', 'owner_id') owner: any;

  get syncStatus(): SyncStatus {
    return {
      status: this.syncStatusRaw as 'pending' | 'synced' | 'error',
      lastSyncAt: this.lastSyncAt,
      errorMessage: this.syncError,
    };
  }
}