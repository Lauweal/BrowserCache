import { isEmpty } from "@frade-sam/samtools";
import { AbstractTable, Data } from "./abstract";


export class LocalTable<T = any> extends AbstractTable<T, Storage> {

    private set(value:Data<T>[]):Data<T>[] {
        const key = `${this.db}_${this.name}`;
        try {
            this.table.setItem(key, JSON.stringify(value));
        } catch (error) {
            this.table.setItem(key, JSON.stringify([]));
        }
        return value;
    }
    private get():Data<T>[] {
        const key = `${this.db}_${this.name}`;
        try {
            return JSON.parse(this.table.getItem(key));
        } catch (error) {
            return [];
        }
    }

    private has(id: string | number) {
        const table = this.get();
        return !isEmpty(table.find((i) => i.id === id));
    }

    public insert(id: string | number, data: T): Promise<T & { id: string | number; }> {
        return new Promise((reslove) => {
            const payload = { ...data, id };
            if(this.has(id)) {
                this.error('insert', `${id}已经存在`);
                reslove(undefined);
            } else {
                const tables = this.get();
                tables.push(payload);
                this.set(tables)
                this.log('insert', payload);
                reslove(payload)
            }
        });
    }
    public async find(id: string | number): Promise<T & { id: string | number; }> {
        const tables = this.get();
        return tables.find((i) => id === i.id);
    }
    public update(id: string | number, data: T): Promise<T & { id: string | number; }> {
        return new Promise((reslove) => {
            const payload = { ...data, id };
            if(this.has(id)) {
                let tables = this.get();
                tables = tables.map((i) => {
                    if(i.id === id) return payload;
                    return i;
                });
                this.set(tables)
                this.log('update', payload);
                reslove(payload)
            } else {
                this.error('update', `${id}不存在`);
                reslove(undefined)
            }
        });
    }
    public async delete(id: string | number): Promise<boolean> {
        const table = this.get();
        this.set(table.filter((i) => i.id !== id));
        return true;
    }
    public finds(ids: (string | number)[]): Promise<(T & { id: string | number; })[]> {
        return Promise.all(ids.map((id) => this.find(id)));
    }
    public updates(data: (T & { id: string | number; })[]): Promise<boolean> {
        return Promise.all(data.map(({ id, ...params }) => this.update(id,params as any))).then((status) => status.every(Boolean))
    }
    public async deletes(ids: (string | number)[]): Promise<boolean> {
        const table = this.get();
        this.set(table.filter((i) => !ids.includes(i.id)));
        return true;
    }
}