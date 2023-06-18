import { get } from 'lodash';
import { isFunc, log } from '@frade-sam/samtools';
import { AbstractDB, AbstractTable, Table } from "./abstract.db";


class IndexDBTable<T = any> extends AbstractTable<T, IDBObjectStore> {
  public delete(id: string): Promise<boolean> {
    const res = this.db.delete(id);
    return new Promise((reslove, reject) => {
      res.onsuccess = (event) => {
        log.info(`[INDEX_DB(update) ==> ${this.name}]:${id}`, res.result);
        reslove(true);
      }
      res.onerror = (event) => {
        log.error(`[INDEX_DB(update) ==> ${this.name}]:${id}`, event);
        reject(false);
      }
    })
  }

  public update(id: string, data: T): Promise<Table<T>> {
    const res = this.db.put({ ...data, id });
    return new Promise((reslove, reject) => {
      res.onsuccess = (event) => {
        log.info(`[INDEX_DB(update) ==> ${this.name}]:${id}`, { ...data, id }, res.result);
        reslove({ ...data, id } as Table<T>);
      }
      res.onerror = (event) => {
        log.error(`[INDEX_DB(update) ==> ${this.name}]:${id}`, event);
        reject(event);
      }
    })
  }

  public find(id: string): Promise<Table<T>> {
    const res = this.db.get(id);
    return new Promise((reslove, reject) => {
      res.onsuccess = (event) => {
        log.info(`[INDEX_DB(find) ==> ${this.name}]:${id}`, res.result);
        reslove(res.result);
      }
      res.onerror = (event) => {
        log.error(`[INDEX_DB(find) ==> ${this.name}]:${id}`, event);
        reject(event);
      }
    })
  }


  public async add(id: string, data: T): Promise<Table<T>> {
    const res = this.db.add({ ...data, id });
    return new Promise((reslove, reject) => {
      res.onsuccess = (event) => {
        log.info(`[INDEX_DB(add) ==> ${this.name}]:${id}`, { ...data, id }, res.result);
        reslove({ ...data, id });
      }
      res.onerror = (event) => {
        log.error(`[INDEX_DB(add) ==> ${this.name}]:${id}`, event);
        reject(event);
      }
    })
  }
}

export class IndexDbStorage extends AbstractDB {
  private db: IDBDatabase;

  private init(): Promise<IDBDatabase> {
    const database = window.indexedDB.open(this.name, 0);
    const name = this.name;
    return new Promise((resolve, reject) => {
      database.onupgradeneeded = function (event: IDBVersionChangeEvent) {
        const data = get(event, 'target.result');
        log.log(`[INDEX_DB(init) ==> ${name}]`, '创建成功');
        if (data) resolve(data);
      }
      database.onsuccess = (event) => {
        const data = get(event, 'target.result');
        if (data) resolve(data);
      }
      database.onerror = (event) => {
        log.error(`[INDEX_DB(init) ==> ${name}]`, event);
        reject(event);
      }
    })
  }

  public async create(): Promise<AbstractDB> {
    await this.createVersion();
    try {
      this.db = await this.init();
      this.status = true;
      return this;
    } catch (error) {
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
      return new IndexDBTable<T>(this.db.createObjectStore(key, { keyPath: 'id' }), key);
    }
    return new IndexDBTable<T>(this.db.transaction([key], "readwrite").objectStore(key), key);
  }

}