import { isArray, log } from "@frade-sam/samtools";
import { AbstractDB, AbstractTable, Table } from "./abstract.db";


class DefaultDBTable<T = any> extends AbstractTable<T, Storage> {
  public async add(id: string, data: T): Promise<Table<T>> {
    try {
      const tables = JSON.parse(this.db.getItem(this.name)) as Table<T>[];
      const res = tables.find((item) => item.id === id);
      if (res) {
        log.info(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '已经存在');
        throw new Error('已经存在');
      }
      tables.push({ ...data, id } as Table<T>);
      this.db.setItem(this.name, JSON.stringify(tables ?? []));
      return { ...data, id } as Table<T>;
    } catch (error) {
      log.error(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '访问异常');
      throw new Error('访问异常');
    }
  }
  public async find(id: string): Promise<Table<T>> {
    try {
      const tables = JSON.parse(this.db.getItem(this.name)) as Table<T>[];
      if (isArray(tables)) {
        const res = tables.find((item) => item.id === id);
        if (res) {
          log.info(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, res);
          return res;
        }
        log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, '不存在');
        return undefined;
      }
      log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, '不存在');
      return undefined;
    } catch (error) {
      log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, error);
      return undefined;
    }
  }
  public async update(id: string, data: T): Promise<Table<T>> {
    try {
      let tables = JSON.parse(this.db.getItem(this.name)) as Table<T>[];
      tables = tables.map((item) => {
        if (item.id === id) {
          return { ...item, ...data };
        }
        return item;
      })
      this.db.setItem(this.name, JSON.stringify(tables ?? []));
      log.info(`[LOCAL_DB(update) ==> ${this.name}]:${id}`, tables);
      return { ...data, id } as Table<T>;
    } catch (error) {
      log.error(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '访问异常');
      throw new Error('访问异常');
    }
  }
  public async delete(id: string): Promise<boolean> {
    try {
      let tables = JSON.parse(this.db.getItem(this.name)) as Table<T>[];
      tables = tables.filter((item) => item.id !== id);
      this.db.setItem(this.name, JSON.stringify(tables ?? []));
      log.info(`[LOCAL_DB(delete) ==> ${this.name}]:${id}`, tables);
      return true;
    } catch (error) {
      log.error(`[LOCAL_DB(delete) ==> ${this.name}]:${id}`, '访问异常');
      return false;
    }
  }
}

export class DefaultDBStorage extends AbstractDB {
  public async create(): Promise<AbstractDB> {
    await this.createVersion();
    this.status = true;
    return this;
  }
  public close(): void {
    this.status = false
  }
  public table<T = any>(name: string): AbstractTable<T> {
    if (!this.status) return;
    const key = `${this.name}_${name}_${this.version}`;
    return new DefaultDBTable<T>(localStorage, key)
  }
}