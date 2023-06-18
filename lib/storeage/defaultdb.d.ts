import { AbstractDB, AbstractTable } from "./abstract.db";
export declare class DefaultDBStorage extends AbstractDB {
    create(): Promise<AbstractDB>;
    close(): void;
    table<T = any>(name: string): AbstractTable<T>;
}
