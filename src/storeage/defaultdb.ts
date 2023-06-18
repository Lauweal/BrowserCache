import { isArray, log } from "@frade-sam/samtools";
import { AbstractDB, AbstractTable, Table, getFingerprintCode } from "./abstract.db";


class DefaultDBTable<T = any> extends AbstractTable<T, Storage> {
  private serialize(value) {
    try {
      this.db.setItem(this.name, JSON.stringify(value ?? []));
      return value;
    } catch (error) {
      this.db.setItem(this.name, JSON.stringify([]));
      return [];
    }
  }

  private deserialize(valueNew) {
    try {
      const val = this.db.getItem(valueNew);
      return JSON.parse(val);
    } catch (error) {
      return [];
    }
  }

  public async add(id: string, data: T): Promise<Table<T>> {
    const tables = this.deserialize(this.name) as Table<T>[];
    try {
      const res = tables.find((item) => item.id === id);
      if (res) {
        this.log('error', id, '新增', '已经存在');
        return;
      }
      tables.push({ ...data, id } as Table<T>);
      this.serialize(tables);
      this.log('info', id, '新增', tables);
      return { ...data, id } as Table<T>;
    } catch (error) {
      this.log('error', id, '新增', error);
      return undefined;
    }
  }
  public async find(id: string): Promise<Table<T>> {
    try {
      const tables = this.deserialize(this.name);
      if (isArray(tables)) {
        const res = tables.find((item) => item.id === id);
        if (res) {
          this.log('info', id, '查找', res);
          return res;
        }
        this.log('error', id, '查找', id);
        return undefined;
      }
      this.log('error', id, '查找', id);
      return undefined;
    } catch (error) {
      this.log('error', id, '查找', error);
      return undefined;
    }
  }
  public async update(id: string, data: T): Promise<Table<T>> {
    let tables = this.deserialize(this.name) as Table<T>[];
    try {
      tables = tables.map((item) => {
        if (item.id === id) {
          return { ...item, ...data };
        }
        return item;
      })
      this.serialize(tables);
      this.log('info', id, '更新', tables);
      return { ...data, id } as Table<T>;
    } catch (error) {
      this.log('error', id, '更新', error);
      return undefined
    }
  }
  public async delete(id: string): Promise<boolean> {
    let tables = this.deserialize(this.name) as Table<T>[];
    try {
      tables = tables.filter((item) => item.id !== id);
      this.serialize(tables);
      this.log('info', id, '删除', id);
      return true;
    } catch (error) {
      this.log('error', id, '删除', error);
      return false;
    }
  }
}

export class DefaultDBStorage extends AbstractDB {
  public async create(): Promise<AbstractDB> {
    this.version = await getFingerprintCode();
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