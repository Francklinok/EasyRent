import { appSchema, tableSchema } from '@nozbe/watermelondb';

 const schemas = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'properties',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'bedrooms', type: 'number', isOptional: true },
        { name: 'bathrooms', type: 'number', isOptional: true },
        { name: 'area', type: 'number', isOptional: true },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'owner_id', type: 'string' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'last_sync_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'property_images',
      columns: [
        { name: 'property_id', type: 'string' },
        { name: 'local_path', type: 'string' },
        { name: 'remote_url', type: 'string', isOptional: true },
        { name: 'is_primary', type: 'boolean' },
        { name: 'order', type: 'number' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'last_sync_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'sender_id', type: 'string' },
        { name: 'receiver_id', type: 'string' },
        { name: 'property_id', type: 'string', isOptional: true },
        { name: 'content', type: 'string' },
        { name: 'is_read', type: 'boolean' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'last_sync_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'avatar', type: 'string', isOptional: true },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'last_sync_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'contracts',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'property_id', type: 'string' },
        { name: 'seller_id', type: 'string' },
        { name: 'buyer_id', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'document_path', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'start_date', type: 'number', isOptional: true },
        { name: 'end_date', type: 'number', isOptional: true },
        { name: 'is_signed', type: 'boolean' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'last_sync_at', type: 'number', isOptional: true },
      ]
    }),
  ]
});
export  default schemas