export declare type Table<T = any> = {
    id: number | string;
} & T;
export declare abstract class AbstractTable<T = any, D = any> {
    protected db: D;
    protected name: string;
    constructor(db: D, name: string);
    private tables;
    abstract add(id: string, data: T): Promise<Table<T>>;
    abstract find(id: string): Promise<Table<T>>;
    abstract update(id: string, data: T): Promise<Table<T>>;
    abstract delete(id: string): Promise<boolean>;
}
export declare abstract class AbstractDB {
    protected name: string;
    constructor(name: string);
    protected status: boolean;
    protected createVersion(): Promise<string>;
    get version(): string;
    set version(v: string);
    abstract create(): Promise<AbstractDB>;
    abstract close(): void;
    abstract table<T = any>(name: string): AbstractTable<T>;
}
