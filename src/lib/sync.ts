import { db } from "./db";

export class SyncManager {
  static async syncTasks() {
    if (!navigator.onLine) return;

    try {
      const pendingCreates = await db.tasks.where('syncStatus').equals('pending_create').toArray();
      const pendingUpdates = await db.tasks.where('syncStatus').equals('pending_update').toArray();
      
      // For each pending create, we would normally POST to our API
      for (const task of pendingCreates) {
        // Mock API call
        console.log("Syncing new task to server:", task);
        await new Promise(resolve => setTimeout(resolve, 500));
        await db.tasks.update(task.id, { syncStatus: 'synced' });
      }

      // For each pending update, we would normally PATCH to our API
      for (const task of pendingUpdates) {
        // Mock API call
        console.log("Syncing task update to server:", task);
        await new Promise(resolve => setTimeout(resolve, 500));
        await db.tasks.update(task.id, { syncStatus: 'synced' });
      }
    } catch (error) {
      console.error("Task sync failed", error);
    }
  }

  static async syncDocuments() {
    if (!navigator.onLine) return;

    try {
      const pendingUpdates = await db.documents.where('syncStatus').equals('pending_update').toArray();
      
      for (const doc of pendingUpdates) {
        console.log("Syncing document update to server:", doc);
        await new Promise(resolve => setTimeout(resolve, 500));
        await db.documents.update(doc.id, { syncStatus: 'synced' });
      }
    } catch (error) {
      console.error("Document sync failed", error);
    }
  }

  static async runFullSync() {
    await this.syncTasks();
    await this.syncDocuments();
  }
}

// Set up online event listener to trigger sync when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log("Network restored. Running sync queue...");
    SyncManager.runFullSync();
  });
}
