// src/database/index.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schemas from './scheme';
import PropertyModel from './model/property';
// Importez les autres modèles

const adapter = new SQLiteAdapter({
  schema: schemas,
  dbName: 'realEstateApp',
  jsi: true, // Pour de meilleures performances
  onSetUpError: error => {
    console.error('Database setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    PropertyModel,
    // Ajoutez les autres modèles ici
  ],
});
