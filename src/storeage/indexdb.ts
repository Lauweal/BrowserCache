import { isEmpty, isFunc, isString, log } from '@frade-sam/samtools';
import { AbstractDB, AbstractTable, Table, getFingerprintCode } from "./abstract.db";


class IndexDBTable<T = any> extends AbstractTable<T, IDBObjectStore> {
  private serialize(value) {
    if (typeof value === 'function') {
      return value.toString();
    }
    if (typeof value === 'object') {
      var serializeObject = {};
      for (const [objectKey, objectValue] of Object.entries(value)) {
        serializeObject[objectKey] = this.serialize(objectValue);
      }
      return serializeObject;
    }

    return value;
  }

  private deserialize(valueNew) {
    if (isString(valueNew) && valueNew.toLowerCase().startsWith('function(')) {
      return Function('"use strict";return ' + valueNew);
    }
    if (typeof valueNew === 'object') {
      var deserializeObject = {};
      for (const [objectKey, objectValue] of Object.entries(valueNew)) {
        deserializeObject[objectKey] = this.deserialize(objectValue);
      }
      return deserializeObject;
    }

    return valueNew;
  }

  public delete(id: string): Promise<boolean> {
    try {
      const res = this.db.delete(id);
      return new Promise((reslove) => {
        res.onsuccess = (event) => {
          this.log('info', id, '删除', id);
          reslove(true);
        }
        res.onerror = (event: any) => {
          this.log('error', id, '删除', event.target.error);
          reslove(false);
        }
      })
    } catch (error) {
      this.log('error', id, '删除', error);
      return Promise.resolve(false);
    }
  }

  public update(id: string, data: T): Promise<Table<T>> {
    const payload = this.serialize({ ...data, id });
    try {
      const res = this.db.put(payload);
      return new Promise((reslove) => {
        res.onsuccess = (event) => {
          this.log('info', id, '更新', payload);
          reslove({ ...data, id } as Table<T>);
        }
        res.onerror = (event: any) => {
          this.log('error', id, '更新', event.target.error);
          reslove({ ...data, id });
        }
      })
    } catch (error) {
      this.log('error', id, '更新', error);
      return Promise.resolve(undefined);
    }
  }

  public find(id: string): Promise<Table<T>> {
    try {
      const res = this.db.get(id);
      return new Promise((reslove) => {
        res.onsuccess = (event) => {
          this.log('info', id, '查找', res.result);
          if (isEmpty(res.result)) return reslove(undefined);
          reslove(this.deserialize(res.result));
        }
        res.onerror = (event: any) => {
          this.log('error', id, '查找', event.target.error);
          reslove(undefined);
        }
      })
    } catch (error) {
      this.log('error', id, '查找', error);
      return Promise.resolve(undefined);
    }
  }


  public async add(id: string, data: T): Promise<Table<T>> {
    const payload = this.serialize({ ...data, id });
    try {
      const res = this.db.add(payload);
      return new Promise((reslove) => {
        res.onsuccess = (event) => {
          this.log('info', id, '新增', payload);
          reslove({ ...data, id });
        }
        res.onerror = (event: any) => {
          this.log('error', id, '新增', event.target.error);
          reslove(undefined);
        }
      })
    } catch (error) {
      this.log('error', id, '新增', error);
      return Promise.resolve(undefined);
    }
  }
}

export class IndexDbStorage extends AbstractDB {
  private db: IDBDatabase;

  private key() {
    const keys = this.name.split('');
    return keys.reduce((a, b) => a | b.charCodeAt(0), 0);
  }

  private init(): Promise<IDBDatabase> {
    const database = window.indexedDB.open(this.name, this.key());
    return new Promise((resolve, reject) => {
      database.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        this.log('info', '初始化', '成功');
        if (database.result) resolve(database.result);
      }
      database.onsuccess = (event) => {
        if (database.result) resolve(database.result);
      }
      database.onerror = (event) => {
        this.log('error', '初始化', '失败');
        reject(event);
      }
    })
  }

  public async create(): Promise<AbstractDB> {
    this.version = await getFingerprintCode();
    try {
      this.db = await this.init();
      this.status = true;
      return this;
    } catch (error) {
      this.log('error', '创建', error);
      this.status = false;
      return this;
    }
  }

  public close() {
    if (this.db && isFunc(this.db.close)) this.db.close();
    this.status = false
  }

  public table<T = any>(name: string): AbstractTable<T, IDBObjectStore> {
    if (!this.status) return;
    const key = `${name}_${this.version}`;
    if (!this.db.objectStoreNames.contains(key)) {
      this.db.createObjectStore(key, { keyPath: 'id', });
    }
    return new IndexDBTable<T>(this.db.transaction([key], "readwrite").objectStore(key), name);
  }

}