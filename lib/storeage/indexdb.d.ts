import { AbstractDB, AbstractTable } from "./abstract.db";
export declare class IndexDbStorage extends AbstractDB {
    private db;
    private key;
    private init;
    create(): Promise<AbstractDB>;
    close(): void;
    table<T = any>(name: string): AbstractTable<T, IDBObjectStore>;
}
