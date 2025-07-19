export interface IContent {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  ttl: number; // Time to live in seconds
  createdAt: number; // Timestamp of creation
  expiresAt: number; // Timestamp of expiration
}

export interface IContentUpdate {
  id: string;
  content?: string; // Optional, if not provided, it won't be updated
  role?: 'user' | 'assistant' | 'system'; // Optional, if not provided, it won't be updated
  ttl?: number; // Optional, if not provided, it won't be updated
  createdAt?: number; // Optional, if not provided, it won't be updated
}

export interface IStorage {
  store(values: IContent[]): Promise<void>;
  update(value: IContent): Promise<void>;
  load(id: string): Promise<IContent>;
  filter(shouldLoad: (content: IContent) => boolean): Promise<IContent[]>;
  remove(key: string): Promise<void>;
}

class Storage {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  async store(values: IContent[]): Promise<void> {
    const transaction = this.db.transaction('contents', 'readwrite');
    const store = transaction.objectStore('contents');
    values.forEach(value => {
      store.put(value);
    });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }

  async update(value: IContent): Promise<void> {
    const transaction = this.db.transaction('contents', 'readwrite');
    const store = transaction.objectStore('contents');
    const existingReq = store.get(value.id);
    return new Promise<void>((resolve, reject) => {
      existingReq.onsuccess = (event) => {
        const existingContent = (event.target as IDBRequest<IContent>).result;
        if (existingContent) {
          // Update the content with new values
          Object.assign(existingContent, value);
          store.put(existingContent);
        } else {
          // If no existing content, just add the new one
          store.put(value);
        }
        resolve();
      };
      existingReq.onerror = (event) => {
        reject(event);
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }

  async load(id: string): Promise<IContent> {
    const transaction = this.db.transaction('contents', 'readonly');
    const store = transaction.objectStore('contents');
    const request = store.get(id);
    return new Promise<IContent>((resolve, reject) => {
      request.onsuccess = (event) => {
        const content = (event.target as IDBRequest<IContent>).result;
        if (content) {
          resolve(content);
        } else {
          reject(new Error(`Content with id ${id} not found`));
        }
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  async filter(shouldLoad: (content: IContent) => boolean): Promise<IContent[]> {
    const transaction = this.db.transaction('contents', 'readonly');
    const store = transaction.objectStore('contents');
    const cursorRequest = store.openCursor();
    const results: IContent[] = [];
    return new Promise<IContent[]>((resolve, reject) => {
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const content = cursor.value as IContent;
          if (shouldLoad(content)) {
            results.push(content);
          }
          cursor.continue();
        }
        else {
          resolve(results);
        }
      };
      cursorRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  async remove(key: string): Promise<void> {
    const transaction = this.db.transaction('contents', 'readwrite');
    const store = transaction.objectStore('contents');
    return new Promise<void>((resolve, reject) => {
      store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }
}

export async function createStorage(): Promise<IStorage> {
  const request = window.indexedDB.open('contents');
  return new Promise<IStorage>((resolve, reject) => {
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('contents')) {
        db.createObjectStore('contents', { keyPath: 'id' }).createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    }
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = () => {
      const db = request.result;
      const storage = new Storage(db);
      resolve(storage);
    };
  });
}

