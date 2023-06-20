import { AbstractTable } from "./abstract";

export class IndexDBTable<T = any> extends AbstractTable<T, IDBObjectStore> {
    public async insert(id: string | number, data: T): Promise<T & { id: string | number; }> {
        if(!this.check(data)) return Promise.resolve(undefined);
        return new Promise((reslove) => {
            const payload = { ...data, id };
            const res = this.table.add(this.serialize(payload));
            res.onsuccess = () => {
                this.log('insert', payload);
                reslove(payload);
            }
            res.onerror = (ev: any) => {
                this.error('insert', ev.target.error);
                reslove(undefined);
            }
        })
    }
    public find(id: string | number): Promise<T & { id: string | number; }> {
        return new Promise((reslove) => {
            const res = this.table.get(id);
            res.onsuccess = () => {
                this.log('find', res.result);
                reslove(res.result)
            }
            res.onerror = (ev: any) => {
                this.error('find', ev.target.error);
                this.table.transaction.abort();
                reslove(undefined);
            }
        })
    }
    public update(id: string | number, data: T): Promise<T & { id: string | number; }> {
        if(!this.check(data)) return Promise.resolve(undefined);
        return new Promise((reslove) => {
            const payload = { ...data, id };
            const res = this.table.put(this.serialize(payload));
            res.onsuccess = () => {
                this.log('update', payload);
                reslove(payload);
            }
            res.onerror = (ev: any) => {
                this.error('update', ev.target.error);
                this.table.transaction.abort();
                reslove(undefined);
            }
        })
    }
    public delete(id: string | number): Promise<boolean> {
        return new Promise((reslove) => {
            const res = this.table.delete(id);
            res.onsuccess = () => {
                this.log('delete', id);
                reslove(true);
            }
            res.onerror = (ev: any) => {
                this.error('delete', ev.target.error);
                this.table.transaction.abort();
                reslove(false);
            }
        })
    }
    public finds(ids: (string | number)[]): Promise<(T & { id: string | number; })[]> {
        return new Promise((reslove) => {
            const res = this.table.getAll(ids);
            res.onsuccess = () => {
                this.log('finds', res.result);
                reslove(res.result)
            }
            res.onerror = (ev: any) => {
                this.error('finds', ev.target.error);
                this.table.transaction.abort();
                reslove(undefined);
            }
        })
    }
    public updates(data: (T & { id: string | number; })[]): Promise<boolean> {
        return Promise.all(data.map(({ id, ...params }) => this.update(id, params as any))).then((status) => status.every(Boolean))
    }
    public deletes(ids: (string | number)[]): Promise<boolean> {
        return new Promise((reslove) => {
            const res = this.table.delete(ids);
            res.onsuccess = () => {
                this.log('delete', ids);
                reslove(true);
            }
            res.onerror = (ev: any) => {
                this.error('delete', ev.target.error);
                this.table.transaction.abort();
                reslove(false);
            }
        })
    }
}