import Dexie, { type EntityTable } from 'dexie';

export interface LocalTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  syncStatus: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  updatedAt: string;
}

export interface LocalDocument {
  id: string;
  title: string;
  content: string | null;
  projectId: string;
  syncStatus: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  updatedAt: string;
}

export const db = new Dexie('NexusDatabase') as Dexie & {
  tasks: EntityTable<LocalTask, 'id'>;
  documents: EntityTable<LocalDocument, 'id'>;
};

db.version(1).stores({
  tasks: 'id, title, status, projectId, syncStatus, updatedAt',
  documents: 'id, title, projectId, syncStatus, updatedAt'
});
